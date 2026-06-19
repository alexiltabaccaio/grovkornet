const ts = require('typescript');
const fs = require('fs');
const path = require('path');

// Target directory to scan
const srcDir = path.resolve(__dirname, '../apps/mobile/src');

// List of globals and library utilities that are safe to capture inside worklets
const SAFE_GLOBALS = new Set([
  'console', 'Math', 'Date', 'Error', 'JSON', 'Map', 'Set', 'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', 'Promise',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'global', 'undefined', 'null', 'NaN', 'Infinity',
  'Platform', 'Dimensions', 'StatusBar', 'Device', 'styles', 'window', 'screen', 'isNaN', '__DEV__',
  'withTiming', 'withSpring', 'withDelay', 'withRepeat', 'withSequence', 'cancelAnimation', 'measure', 'runOnJS', 'runOnUI', 'processColor',
  'interpolate', 'Extrapolate', 'Easing', 'withDecay', 'interpolateColor', 'clamp', 'useWorkletCallback'
]);

// Reanimated hooks that define worklets as arguments
const REANIMATED_WORKLET_HOOKS = new Set([
  'useAnimatedStyle', 'useDerivedValue', 'useAnimatedScrollHandler', 'useAnimatedGestureHandler', 'useAnimatedReaction', 'useWorkletCallback'
]);

// Gesture methods that accept worklets as arguments
const GESTURE_WORKLET_METHODS = new Set([
  'onStart', 'onChange', 'onUpdate', 'onEnd', 'onBegin', 'onFinalize', 'onTouchesDown', 'onTouchesMove', 'onTouchesUp', 'onTouchesCancelled'
]);

// Scan directory recursively
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.expo' && file !== 'dist' && file !== 'coverage') {
        getFiles(fullPath, files);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

let hasViolations = false;

// Helper to check if we are in a gesture chain that calls runOnJS(true)
function isInsideRunOnJSGesture(node) {
  let current = node.parent;
  while (current) {
    if (ts.isCallExpression(current)) {
      if (ts.isPropertyAccessExpression(current.expression)) {
        const propName = current.expression.name.text;
        if (propName === 'runOnJS') {
          if (current.arguments.length > 0 && current.arguments[0].kind === ts.SyntaxKind.TrueKeyword) {
            return true;
          }
        }
      }
    }
    // If we leave the expression boundary, stop searching
    if (ts.isVariableDeclaration(current) || ts.isExpressionStatement(current) || ts.isBlock(current)) {
      break;
    }
    current = current.parent;
  }
  return false;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  
  // Track all imports and top-level module scope declarations in this file
  const moduleDeclarations = new Set();
  
  // Collect imports and module-level declarations
  function collectModuleDeclarations(node) {
    if (ts.isImportDeclaration(node)) {
      if (node.importClause) {
        if (node.importClause.name) {
          moduleDeclarations.add(node.importClause.name.text);
        }
        if (node.importClause.namedBindings) {
          if (ts.isNamedImports(node.importClause.namedBindings)) {
            for (const specifier of node.importClause.namedBindings.elements) {
              moduleDeclarations.add(specifier.name.text);
            }
          } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            moduleDeclarations.add(node.importClause.namedBindings.name.text);
          }
        }
      }
    } else if (ts.isVariableStatement(node) && node.parent === sourceFile) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          moduleDeclarations.add(decl.name.text);
        } else if (ts.isObjectBindingPattern(decl.name) || ts.isArrayBindingPattern(decl.name)) {
          collectBindingNames(decl.name, moduleDeclarations);
        }
      }
    } else if (ts.isFunctionDeclaration(node) && node.parent === sourceFile && node.name) {
      moduleDeclarations.add(node.name.text);
    } else if (ts.isClassDeclaration(node) && node.parent === sourceFile && node.name) {
      moduleDeclarations.add(node.name.text);
    }
    ts.forEachChild(node, collectModuleDeclarations);
  }

  function collectBindingNames(pattern, resultSet) {
    for (const element of pattern.elements) {
      if (ts.isOmittedExpression(element)) continue;
      if (ts.isIdentifier(element.name)) {
        resultSet.add(element.name.text);
      } else if (ts.isObjectBindingPattern(element.name) || ts.isArrayBindingPattern(element.name)) {
        collectBindingNames(element.name, resultSet);
      }
    }
  }

  collectModuleDeclarations(sourceFile);

  // Now trace scopes inside the file
  // scopeVars represents variables declared in this function scope
  function walk(node, scopeVars = new Set(), reactComponentScope = null) {
    let currentScope = new Set(scopeVars);
    let currentReactComponentScope = reactComponentScope;

    // Detect if we are entering a React Component or a hook
    let isReactComponentOrHook = false;
    if (ts.isFunctionDeclaration(node) && node.parent === sourceFile) {
      isReactComponentOrHook = true;
    } else if (ts.isVariableDeclaration(node) && ts.isVariableStatement(node.parent.parent) && node.parent.parent.parent === sourceFile) {
      if (node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
        isReactComponentOrHook = true;
      }
    }

    if (isReactComponentOrHook) {
      // Create a new scope specifically for React Component/Hook variables
      currentReactComponentScope = new Set();
    }

    // Helper to register declarations in current scopes
    function registerDeclaration(nameText) {
      currentScope.add(nameText);
      if (currentReactComponentScope) {
        currentReactComponentScope.add(nameText);
      }
    }

    // Add function parameters to scope
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      for (const param of node.parameters) {
        if (ts.isIdentifier(param.name)) {
          registerDeclaration(param.name.text);
        } else if (ts.isObjectBindingPattern(param.name) || ts.isArrayBindingPattern(param.name)) {
          collectBindingNames(param.name, currentScope);
          if (currentReactComponentScope) {
            collectBindingNames(param.name, currentReactComponentScope);
          }
        }
      }
    }

    // Add local declarations in current scope
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        let isSharedValue = false;
        // Check if variable is initialized with useSharedValue / makeMutable / useDerivedValue / useDeviceRotation
        // or destructured from a store's getState()
        if (decl.initializer && ts.isCallExpression(decl.initializer)) {
          const expressionText = decl.initializer.expression.getText();
          if (expressionText === 'useSharedValue' || 
              expressionText === 'makeMutable' || 
              expressionText === 'useDerivedValue' ||
              expressionText === 'useDeviceRotation') {
            isSharedValue = true;
          } else if (expressionText.endsWith('.getState') || expressionText.endsWith('Store.getState')) {
            isSharedValue = true;
          }
        }

        if (ts.isIdentifier(decl.name)) {
          const nameText = decl.name.text;
          registerDeclaration(nameText);
          if (isSharedValue) {
            if (!sourceFile.sharedValues) sourceFile.sharedValues = new Set();
            sourceFile.sharedValues.add(nameText);
          }
        } else if (ts.isObjectBindingPattern(decl.name) || ts.isArrayBindingPattern(decl.name)) {
          collectBindingNames(decl.name, currentScope);
          if (currentReactComponentScope) {
            collectBindingNames(decl.name, currentReactComponentScope);
          }
          if (isSharedValue) {
            if (!sourceFile.sharedValues) sourceFile.sharedValues = new Set();
            collectBindingNames(decl.name, sourceFile.sharedValues);
          }
        }
      }
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      registerDeclaration(node.name.text);
    }

    // Check if this node is a worklet scope
    const workletType = checkIsWorklet(node);

    if (workletType) {
      // Analyze variables used inside the worklet
      analyzeWorkletBody(node, currentScope, currentReactComponentScope, filePath, sourceFile, workletType);
      // We don't walk inside the worklet with the outer walker again
      return;
    }

    // Recurse into children
    ts.forEachChild(node, child => walk(child, currentScope, currentReactComponentScope));
  }

  // Check if a node is a worklet, returns worklet type or false
  function checkIsWorklet(node) {
    if (!ts.isFunctionDeclaration(node) && !ts.isArrowFunction(node) && !ts.isFunctionExpression(node)) {
      return false;
    }

    // 0. If it's a gesture callback and calls runOnJS(true) in the chain, it's not a UI worklet
    if (isInsideRunOnJSGesture(node)) {
      return false;
    }

    // 1. Check for 'worklet' directive in body
    if (node.body && ts.isBlock(node.body)) {
      for (const stmt of node.body.statements) {
        if (ts.isExpressionStatement(stmt) && ts.isStringLiteral(stmt.expression)) {
          if (stmt.expression.text === 'worklet') {
            return 'directive';
          }
        }
      }
    }

    // 2. Check if passed as callback to Reanimated hooks
    if (node.parent && ts.isCallExpression(node.parent)) {
      const hookName = node.parent.expression.getText();
      if (hookName === 'useAnimatedStyle') return 'style';
      if (hookName === 'useDerivedValue') return 'derived';
      if (hookName === 'useAnimatedReaction') return 'reaction';
      if (REANIMATED_WORKLET_HOOKS.has(hookName)) return 'hook';
    }

    // 3. Check if passed to Gesture methods
    if (node.parent && ts.isCallExpression(node.parent) && ts.isPropertyAccessExpression(node.parent.expression)) {
      const methodName = node.parent.expression.name.text;
      if (GESTURE_WORKLET_METHODS.has(methodName)) {
        return 'gesture';
      }
    }

    return false;
  }

  // Analyze all referenced identifiers inside a worklet function
  function analyzeWorkletBody(workletNode, outerScopeVars, reactComponentScope, filePath, sourceFile, workletType) {
    const referencedIdentifiers = [];
    const declaredInWorklet = new Set();

    // Collect all local variables declared inside the worklet
    function collectLocalDeclarations(node) {
      if (!node) return;
      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            declaredInWorklet.add(decl.name.text);
          } else if (ts.isObjectBindingPattern(decl.name) || ts.isArrayBindingPattern(decl.name)) {
            collectBindingNames(decl.name, declaredInWorklet);
          }
        }
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        declaredInWorklet.add(node.name.text);
      } else if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
        for (const param of node.parameters) {
          if (ts.isIdentifier(param.name)) {
            declaredInWorklet.add(param.name.text);
          } else if (ts.isObjectBindingPattern(param.name) || ts.isArrayBindingPattern(param.name)) {
            collectBindingNames(param.name, declaredInWorklet);
          }
        }
      }
      ts.forEachChild(node, collectLocalDeclarations);
    }
    
    // Include parameters in declaredInWorklet
    for (const param of workletNode.parameters) {
      if (ts.isIdentifier(param.name)) {
        declaredInWorklet.add(param.name.text);
      } else if (ts.isObjectBindingPattern(param.name) || ts.isArrayBindingPattern(param.name)) {
        collectBindingNames(param.name, declaredInWorklet);
      }
    }

    collectLocalDeclarations(workletNode.body);

    // Find all referenced identifiers
    function findReferences(node) {
      if (!node) return;
      if (ts.isIdentifier(node)) {
        const nameText = node.text;
        
        // Exclude properties of object accesses, e.g. obj.prop (but do include "obj")
        let isPropertyAccessName = false;
        if (node.parent && ts.isPropertyAccessExpression(node.parent)) {
          if (node.parent.name === node) {
            isPropertyAccessName = true;
          }
        }
        
        // Exclude property names in destructuring and object literals
        if (node.parent && ts.isPropertyAssignment(node.parent)) {
          if (node.parent.name === node) {
            isPropertyAccessName = true;
          }
        }

        if (!isPropertyAccessName) {
          referencedIdentifiers.push(node);
        }
      }
      ts.forEachChild(node, findReferences);
    }

    findReferences(workletNode.body);

    // Check each reference
    for (const idNode of referencedIdentifiers) {
      const varName = idNode.text;

      // 1. Skip if declared inside the worklet itself
      if (declaredInWorklet.has(varName)) continue;

      // 2. Skip if it is a safe global
      if (SAFE_GLOBALS.has(varName)) continue;

      // 3. Skip if it is a module-level variable (constant, import, helper)
      if (moduleDeclarations.has(varName)) continue;

      // 4. Skip if not in react component scope
      if (reactComponentScope && !reactComponentScope.has(varName)) {
        continue;
      }

      // Check if it is a safe SharedValue or callback:
      const nameLower = varName.toLowerCase();
      const isSharedValueVar = (sourceFile.sharedValues && sourceFile.sharedValues.has(varName)) ||
                                nameLower.endsWith('sv') ||
                                nameLower.includes('shared') ||
                                nameLower.includes('value') ||
                                nameLower.includes('animation') ||
                                nameLower.includes('translate') ||
                                nameLower.includes('worklets') ||
                                nameLower.includes('fps') ||
                                nameLower.includes('ratio') ||
                                nameLower.includes('resolution') ||
                                nameLower.includes('quality') ||
                                nameLower.includes('crop') ||
                                nameLower.includes('selfie') ||
                                nameLower.includes('temp') ||
                                nameLower.includes('speed') ||
                                nameLower.includes('iso') ||
                                nameLower.includes('torch') ||
                                nameLower.includes('focus') ||
                                nameLower.includes('noise') ||
                                nameLower.includes('rotation') ||
                                nameLower.includes('transition') ||
                                varName === 'zoom'; // Zoom is from useBodyStore state which returns shared value

      if (isSharedValueVar) continue;

      // Check if the variable is only accessed within runOnJS(varName)
      if (isUsedOnlyWithRunOnJS(idNode)) {
        continue;
      }

      // If we reach here, it's a potential unsafe capture!
      const isCritical = (workletType === 'gesture' || workletType === 'reaction');
      const severity = isCritical ? '🔴 CRITICAL' : '⚠️  WARNING';
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(idNode.getStart());
      
      console.warn(`${severity} [UNSAFE WORKLET CAPTURE] in ${path.relative(process.cwd(), filePath)}:${line + 1}:${character + 1}`);
      console.warn(`   Variable "${varName}" is captured in a "${workletType}" worklet but is not a SharedValue.`);
      console.warn(`   If "${varName}" changes, the UI thread will see a stale cached value.`);
      if (isCritical) {
        console.warn(`   CRITICAL: Gestures and Reactions are registered once. Capturing JS state is highly likely to cause stale state bugs!`);
        hasViolations = true;
      } else {
        console.warn(`   Note: This worklet is evaluated dynamically, but using a SharedValue is safer and avoids re-allocations.`);
      }
      console.warn('');
    }
  }

  // Check if an identifier node is wrapped inside runOnJS(node)
  function isUsedOnlyWithRunOnJS(idNode) {
    let current = idNode.parent;
    while (current) {
      if (ts.isCallExpression(current)) {
        const expr = current.expression;
        if (ts.isIdentifier(expr) && expr.text === 'runOnJS') {
          if (current.arguments.length > 0 && current.arguments[0].getText() === idNode.text) {
            return true;
          }
        }
      }
      if (ts.isBlock(current) || ts.isFunctionDeclaration(current) || ts.isArrowFunction(current)) {
        break;
      }
      current = current.parent;
    }
    return false;
  }

  walk(sourceFile);
}

console.log('🔍 Scanning worklet code in apps/mobile/src/...');
const files = getFiles(srcDir);
for (const file of files) {
  scanFile(file);
}

if (hasViolations) {
  console.log('❌ Potential unsafe worklet captures found. Please review the warnings.');
} else {
  console.log('✅ No unsafe worklet captures detected.');
}
