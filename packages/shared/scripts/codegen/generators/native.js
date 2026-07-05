const { FILE_PATHS, replaceBetweenMarkers } = require('../utils/helpers');

function generateNativeBridge(parameters, renderParams, constants) {
  console.log('\n--- Generating Native Bridge (Step 2) ---');

  // Helper to convert Kotlin types to Kotlin JNI types
  function toKotlinJniType(kotlinType) {
    if (kotlinType === 'Boolean') return 'Boolean';
    if (kotlinType === 'Int') return 'Int';
    if (kotlinType === 'Long') return 'Long';
    if (kotlinType === 'String' || kotlinType === 'String?') return 'String?';
    return 'Float';
  }

  // Helper to convert Kotlin types to C++ JNI types
  function toJniType(kotlinType) {
    if (kotlinType === 'Boolean') return 'jboolean';
    if (kotlinType === 'Int') return 'jint';
    if (kotlinType === 'Long') return 'jlong';
    if (kotlinType === 'String' || kotlinType === 'String?') return 'jstring';
    return 'jfloat';
  }

  // 1. Generate index.ts TypeScript Interface Props
  const tsTypesContent = parameters
    .filter(p => p.ts && p.ts.type && !p.nitro)
    .map(p => {
      const tsName = p.ts.name || p.name;
      const isOptional = p.ts.optional !== false;
      return `${tsName}${isOptional ? '?' : ''}: ${p.ts.type};`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.tsInterface, '// @@GEN_PROPS_START@@', '// @@GEN_PROPS_END@@', tsTypesContent, '  ');

  // 2. Generate NativeFilmCameraModule.kt Prop handlers
  const kotlinPropsContent = parameters
    .filter(p => p.ts && p.kotlin && !p.kotlin.transient && !p.nitro)
    .map(p => {
      const propName = p.ts.name || p.name;
      const kotlinName = p.kotlin.name || p.name;
      
      let kotlinPropType = 'Float?';
      if (p.ts.type.includes('boolean')) {
        kotlinPropType = 'Boolean?';
      } else if (p.ts.type.includes('string')) {
        kotlinPropType = 'String?';
      } else if (p.ts.type.includes('number')) {
        if (p.kotlin.type === 'Long') {
          kotlinPropType = 'Double?';
        } else if (propName === 'cameraAspectRatio' || propName === 'torchState') {
          kotlinPropType = 'Float?';
        } else if (p.kotlin.type === 'Int') {
          kotlinPropType = 'Int?';
        } else {
          kotlinPropType = 'Float?';
        }
      }
      
      const isNullable = p.kotlin && p.kotlin.type && p.kotlin.type.endsWith('?');
      let body = '';
      if (p.kotlin.propHandler) {
        if (isNullable) {
          body = p.kotlin.propHandler;
        } else {
          body = `value?.let { value ->\n  ${p.kotlin.propHandler.split('\n').join('\n  ')}\n}`;
        }
      } else {
        if (isNullable) {
          if (p.category === 'render') {
            body = `view.updateEffect { ${kotlinName} = value }`;
          } else if (p.category === 'hardware') {
            body = `if (view.config.${kotlinName} != value) view.updateHardware { ${kotlinName} = value }`;
          } else {
            body = `if (view.config.${kotlinName} != value) view.updateBoth { ${kotlinName} = value }`;
          }
        } else {
          if (p.category === 'render') {
            body = `value?.let { view.updateEffect { ${kotlinName} = it } }`;
          } else if (p.category === 'hardware') {
            body = `value?.let { if (view.config.${kotlinName} != it) view.updateHardware { ${kotlinName} = it } }`;
          } else {
            body = `value?.let { if (view.config.${kotlinName} != it) view.updateBoth { ${kotlinName} = it } }`;
          }
        }
      }
      
      const indentedBody = body
        .split('\n')
        .map((line, idx) => idx === 0 ? line : '        ' + line)
        .join('\n');
      
      return `Prop("${propName}") { view: NativeFilmCameraView, value: ${kotlinPropType} ->\n  ${indentedBody}\n}`;
    })
    .join('\n\n');
  replaceBetweenMarkers(FILE_PATHS.kotlinModule, '// @@GEN_PROPS_START@@', '// @@GEN_PROPS_END@@', kotlinPropsContent, '      ');

  function toKotlinFallbackDefault(p) {
    const ktType = p.kotlin?.type;
    let def = p.kotlin?.default;
    
    // Try to resolve from constants if not explicitly provided
    if (def === undefined) {
      if (p.zustand?.default && constants && constants[p.zustand.default] !== undefined) {
        def = constants[p.zustand.default];
      }
    }

    if (def !== undefined && def !== null) {
      const defStr = def.toString().trim();
      if (ktType === 'Boolean') {
        return defStr === 'true' ? 'true' : 'false';
      }
      if (ktType === 'Int') {
        return defStr;
      }
      if (ktType === 'Long') {
        return defStr.endsWith('L') ? defStr : `${defStr}L`;
      }
      if (ktType === 'String' || ktType === 'String?') {
        return defStr === 'null' ? 'null' : `"${defStr}"`;
      }
      // Float
      return defStr.endsWith('f') ? defStr : `${defStr}f`;
    }
    
    if (ktType === 'Boolean') return 'false';
    if (ktType === 'Int') return '0';
    if (ktType === 'Long') return '0L';
    if (ktType === 'String' || ktType === 'String?') return 'null';
    return '0.0f';
  }

  // 3. Generate CameraConfiguration.kt Fields
  const renderFieldObjects = parameters.filter(p => p.kotlin && !p.kotlin.transient && p.category === 'render');
  const hardwareFieldObjects = parameters.filter(p => p.kotlin && !p.kotlin.transient && p.category === 'hardware');
  const viewportFieldObjects = parameters.filter(p => p.kotlin && !p.kotlin.transient && p.category === 'viewport');
 
  const renderFields = renderFieldObjects
    .map(p => {
      const cppName = p.cpp?.name || p.kotlin?.name || p.name;
      const capitalized = cppName.charAt(0).toUpperCase() + cppName.slice(1);
      const ktType = toKotlinJniType(p.kotlin?.type);
      const fallbackVal = toKotlinFallbackDefault(p);
      
      if (p.nitro) {
        return `var ${p.kotlin.name || p.name}: ${ktType}
        get() = (CameraStateJNI.fallbackGet("${p.kotlin.name || p.name}", nativePointer, ${fallbackVal}) as ${ktType})
        set(value) {
            CameraStateJNI.fallbackSet("${p.kotlin.name || p.name}", nativePointer, value)
        }`;
      }
      
      return `var ${p.kotlin.name || p.name}: ${ktType}
        get() = if (CameraStateJNI.isJniLoaded) CameraStateJNI.get${capitalized}(nativePointer) else (CameraStateJNI.fallbackGet("${p.kotlin.name || p.name}", nativePointer, ${fallbackVal}) as ${ktType})
        set(value) {
            if (CameraStateJNI.isJniLoaded) {
                CameraStateJNI.set${capitalized}(nativePointer, value)
            } else {
                CameraStateJNI.fallbackSet("${p.kotlin.name || p.name}", nativePointer, value)
            }
        }`;
    })
    .join('\n');

  const hardwareFields = hardwareFieldObjects
    .map(p => {
      const cppName = p.cpp?.name || p.kotlin?.name || p.name;
      const capitalized = cppName.charAt(0).toUpperCase() + cppName.slice(1);
      const ktType = toKotlinJniType(p.kotlin?.type);
      const fallbackVal = toKotlinFallbackDefault(p);
      return `var ${p.kotlin.name || p.name}: ${ktType}
        get() = if (CameraStateJNI.isJniLoaded) CameraStateJNI.get${capitalized}(nativePointer) else (CameraStateJNI.fallbackGet("${p.kotlin.name || p.name}", nativePointer, ${fallbackVal}) as ${ktType})
        set(value) {
            if (CameraStateJNI.isJniLoaded) {
                CameraStateJNI.set${capitalized}(nativePointer, value)
            } else {
                CameraStateJNI.fallbackSet("${p.kotlin.name || p.name}", nativePointer, value)
            }
        }`;
    })
    .join('\n');

  const viewportFields = viewportFieldObjects
    .map(p => {
      const cppName = p.cpp?.name || p.kotlin?.name || p.name;
      const capitalized = cppName.charAt(0).toUpperCase() + cppName.slice(1);
      const ktType = toKotlinJniType(p.kotlin?.type);
      const fallbackVal = toKotlinFallbackDefault(p);
      return `var ${p.kotlin.name || p.name}: ${ktType}
        get() = if (CameraStateJNI.isJniLoaded) CameraStateJNI.get${capitalized}(nativePointer) else (CameraStateJNI.fallbackGet("${p.kotlin.name || p.name}", nativePointer, ${fallbackVal}) as ${ktType})
        set(value) {
            if (CameraStateJNI.isJniLoaded) {
                CameraStateJNI.set${capitalized}(nativePointer, value)
            } else {
                CameraStateJNI.fallbackSet("${p.kotlin.name || p.name}", nativePointer, value)
            }
        }`;
    })
    .join('\n');

  const kotlinFieldsContent = `// Rendering / Effect Props\n${renderFields}\n\n// Hardware Props\n${hardwareFields}\n\n// Viewport Props\n${viewportFields}`;
  replaceBetweenMarkers(FILE_PATHS.kotlinConfig, '// @@GEN_FIELDS_START@@', '// @@GEN_FIELDS_END@@', kotlinFieldsContent, '    ');



  // 4b. Generate CameraConfiguration.kt loadFromMap mapping
  const mapLoaderContent = parameters
    .filter(p => p.kotlin && !p.kotlin.transient)
    .map(p => {
      const kotlinName = p.kotlin.name || p.name;
      const jsKey = p.zustand?.name || p.ts?.name || p.name;
      
      let castExpr = '';
      if (p.kotlin.type === 'Float') {
        castExpr = `(rawValue as? Number)?.toFloat()?.let { ${kotlinName} = it }`;
      } else if (p.kotlin.type === 'Int') {
        castExpr = `(rawValue as? Number)?.toInt()?.let { ${kotlinName} = it }`;
      } else if (p.kotlin.type === 'Long') {
        castExpr = `(rawValue as? Number)?.toLong()?.let { ${kotlinName} = it }`;
      } else if (p.kotlin.type === 'Boolean') {
        castExpr = `(rawValue as? Boolean)?.let { ${kotlinName} = it }`;
      } else if (p.kotlin.type === 'String' || p.kotlin.type === 'String?') {
        castExpr = `(rawValue as? String)?.let { ${kotlinName} = it }`;
      } else {
        castExpr = `// Unhandled type: ${p.kotlin.type}`;
      }
      
      if (jsKey !== p.name) {
        return `val raw_${kotlinName} = payload["${jsKey}"] ?: payload["${p.name}"]\nraw_${kotlinName}?.let { rawValue ->\n    ${castExpr}\n}`;
      } else {
        return `payload["${jsKey}"]?.let { rawValue ->\n    ${castExpr}\n}`;
      }
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.kotlinConfig, '// @@GEN_MAP_LOADER_START@@', '// @@GEN_MAP_LOADER_END@@', mapLoaderContent, '    ');

  // 5. Generate RenderParams.h struct fields
  const allRenderParams = parameters.filter(p => p.category === 'render');
  const cppFieldsContent = allRenderParams
    .map(p => {
      const cppName = p.cpp?.name || p.name;
      return `float ${cppName};`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.cppHeader, '// @@GEN_STRUCT_START@@', '// @@GEN_STRUCT_END@@', cppFieldsContent, '    ');



  // Helper to convert YAML defaults to C++ floats
  function toCppFloatDefault(defVal, p) {
    let def = defVal;
    if (def === undefined || def === null) {
      if (p?.zustand?.default && constants && constants[p.zustand.default] !== undefined) {
        def = constants[p.zustand.default];
      }
    }
    
    if (def === undefined || def === null) return '0.0f';
    const valStr = def.toString().trim();
    if (valStr === 'true') return '1.0f';
    if (valStr === 'false') return '0.0f';
    if (valStr.endsWith('f')) return valStr;
    if (valStr.includes('.')) return `${valStr}f`;
    return `${valStr}.0f`;
  }

  // 7. Generate CameraStateManager.cpp defaults
    const cppDefaultsContent = allRenderParams
    .map(p => {
      const cppName = p.cpp?.name || p.name;
      const defValue = toCppFloatDefault(p.kotlin?.default, p);
      return `initial->renderParams.${cppName} = ${defValue};`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.cppStateManagerSource, '// @@GEN_DEFAULTS_START@@', '// @@GEN_DEFAULTS_END@@', cppDefaultsContent, '    ');

  // 8. Generate CameraStateManager.cpp clamping
  const cppClampingContent = parameters
    .map(p => {
      const isNumeric = p.ts?.type === 'number' || (p.zustand && p.zustand.type === 'number') || (!p.ts?.type && (!p.zustand || p.zustand.type !== 'boolean'));
      if (!isNumeric) return null;

      let clampMin = null;
      let clampMax = null;
      const wConfig = p.worklet || {};
      if (wConfig.clamp) {
        [clampMin, clampMax] = wConfig.clamp;
      } else if (p.ui && typeof p.ui.min === 'number' && typeof p.ui.max === 'number') {
        clampMin = p.ui.min;
        clampMax = p.ui.max;
      }

      if (clampMin === null || clampMax === null) return null;

      const cppFieldName = p.cpp?.name || p.name;
      const isRender = p.category === 'render';
      const fieldAccess = isRender ? `state.renderParams.${cppFieldName}` : `state.${cppFieldName}`;

      const isInt = p.kotlin?.type === 'Int';
      const defaultVal = toCppFloatDefault(p.kotlin?.default, p);
      const floatDefault = defaultVal;
      const intDefault = Math.round(parseFloat(defaultVal) || 0);

      if (isInt) {
        return `${fieldAccess} = std::isnan(static_cast<float>(${fieldAccess})) ? ${intDefault} : std::clamp(${fieldAccess}, ${Math.round(clampMin)}, ${Math.round(clampMax)});`;
      } else {
        return `${fieldAccess} = std::isnan(${fieldAccess}) ? ${floatDefault} : std::clamp(${fieldAccess}, ${clampMin.toFixed(4)}f, ${clampMax.toFixed(4)}f);`;
      }
    })
    .filter(Boolean)
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.cppStateManagerSource, '// @@GEN_CLAMPING_START@@', '// @@GEN_CLAMPING_END@@', cppClampingContent, '    ');

  // 9. Generate JNI Bridge declarations in CameraStateJNI.kt
  const kotlinJniFields = [...renderFieldObjects, ...hardwareFieldObjects, ...viewportFieldObjects].filter(p => !p.nitro);
  const kotlinJniContent = kotlinJniFields
    .map(p => {
      const cppName = p.cpp?.name || p.kotlin?.name || p.name;
      const capitalized = cppName.charAt(0).toUpperCase() + cppName.slice(1);
      const ktType = toKotlinJniType(p.kotlin?.type);
      return `    @JvmStatic external fun get${capitalized}(statePtr: Long): ${ktType}\n    @JvmStatic external fun set${capitalized}(statePtr: Long, value: ${ktType})`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.kotlinJniBridge, '// @@GEN_JNI_METHODS_START@@', '// @@GEN_JNI_METHODS_END@@', kotlinJniContent, '    ');

  // 10. Generate JNI bindings in GrovkornetJni.cpp
  const cppJniBindingsContent = kotlinJniFields
    .map(p => {
      const cppName = p.cpp?.name || p.kotlin?.name || p.name;
      const cppFieldName = p.cpp?.name || p.name;
      const capitalized = cppName.charAt(0).toUpperCase() + cppName.slice(1);
      const jniType = toJniType(p.kotlin?.type);
      const isString = p.kotlin?.type === 'String' || p.kotlin?.type === 'String?';

      let cppGetBody = '';
      let cppSetBody = '';

      if (isString) {
        cppGetBody = `    if (statePtr == 0) {
        std::string val = CameraStateManager::getInstance().getActiveState()->cameraId;
        return env->NewStringUTF(val.c_str());
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return env->NewStringUTF(state->cameraId.c_str());
    }`;
        cppSetBody = `    const char* nativeString = value ? env->GetStringUTFChars(value, nullptr) : nullptr;
    std::string cppVal = nativeString ? nativeString : "";
    if (nativeString) env->ReleaseStringUTFChars(value, nativeString);
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([cppVal](RenderState& state) {
            state.cameraId = cppVal;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->cameraId = cppVal;
        CameraStateManager::getInstance().clampState(*state);
    }`;
      } else {
        const isRender = p.category === 'render';
        const fieldAccess = isRender ? `state.renderParams.${cppFieldName}` : `state.${cppFieldName}`;
        const valueExpr = p.kotlin?.type === 'Boolean' ? `(value == JNI_TRUE)` : `value`;
        const stateField = isRender ? `renderParams.${cppFieldName}` : cppFieldName;

        cppGetBody = `    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->${stateField};
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->${stateField};
    }`;
        cppSetBody = `    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            ${fieldAccess} = ${valueExpr};
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->${stateField} = ${valueExpr};
        CameraStateManager::getInstance().clampState(*state);
    }`;
      }

      return `JNIEXPORT ${jniType} JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_get${capitalized}(
        JNIEnv* env, jclass clazz, jlong statePtr) {
${cppGetBody}
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_set${capitalized}(
        JNIEnv* env, jclass clazz, jlong statePtr, ${jniType} value) {
${cppSetBody}
}`;
    })
    .join('\n\n');

  replaceBetweenMarkers(FILE_PATHS.cppJniSource, '// @@GEN_JNI_BINDINGS_START@@', '// @@GEN_JNI_BINDINGS_END@@', cppJniBindingsContent, '');
}

module.exports = {
  generateNativeBridge
};
