package com.grovkornet.app

object FilmShader {
    const val VERTEX_SHADER = """
        attribute vec4 a_Position;
        attribute vec4 a_TexCoord;
        uniform mat4 u_TransformMatrix;
        uniform mat4 u_ScaleMatrix;
        varying vec2 v_TexCoord;
        varying vec2 v_AberrationDirX;
        varying vec2 v_AberrationDirY;
        void main() {
            gl_Position = u_ScaleMatrix * a_Position;
            v_TexCoord = (u_TransformMatrix * a_TexCoord).xy;
            v_AberrationDirX = (u_TransformMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xy;
            v_AberrationDirY = (u_TransformMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xy;
        }
    """

    const val FRAGMENT_SHADER = """
        precision highp float;
        varying vec2 v_TexCoord;
        varying vec2 v_AberrationDirX;
        varying vec2 v_AberrationDirY;
        uniform sampler2D u_Texture;
        
        uniform float u_Saturation;
        uniform float u_Contrast;
        uniform float u_AberrationIntensity;
        uniform int u_AberrationDirectionType;
        uniform float u_GrainIntensity;
        uniform float u_GrainChroma;
        uniform float u_GrainSize;
        uniform float u_GrainEnabled;
        uniform float u_Time;
        uniform vec2 u_Resolution;
        uniform float u_Ev;
        uniform float u_WhiteBalance;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec4 color = texture2D(u_Texture, v_TexCoord);
            
            // 1. Chromatic Aberration
            float caAmount = u_AberrationIntensity * 0.01; // Scaled for normalized coords
            if (caAmount > 0.0001) {
                vec2 dir;
                if (u_AberrationDirectionType == 0) {
                    dir = v_AberrationDirX;
                } else if (u_AberrationDirectionType == 1) {
                    dir = v_AberrationDirY;
                } else {
                    dir = normalize(v_TexCoord - vec2(0.5, 0.5));
                }
                float r = texture2D(u_Texture, v_TexCoord - dir * caAmount).r;
                float b = texture2D(u_Texture, v_TexCoord + dir * caAmount).b;
                color.r = r;
                color.b = b;
            }

            // 2. Saturation and Contrast
            const vec3 luminanceWeighting = vec3(0.2126, 0.7152, 0.0722);
            float luminance = dot(color.rgb, luminanceWeighting);
            color.rgb = mix(vec3(luminance), color.rgb, u_Saturation);
            color.rgb = ((color.rgb - 0.5) * max(u_Contrast, 0.0)) + 0.5;

            // 3. Film Grain
            if (u_GrainEnabled > 0.5 && u_GrainIntensity > 0.0) {
                vec2 grainCoord = (v_TexCoord * u_Resolution) / u_GrainSize;
                vec2 seed = floor(grainCoord) + vec2(u_Time * 1.5, u_Time * 0.5);
                float noiseR = hash(seed);
                vec3 blend;
                if (u_GrainChroma > 0.5) {
                    float noiseG = hash(seed + vec2(12.34, 56.78));
                    float noiseB = hash(seed + vec2(90.12, 34.56));
                    blend = vec3(noiseR, noiseG, noiseB);
                } else {
                    blend = vec3(noiseR);
                }
                
                vec3 overlay;
                overlay.r = color.r < 0.5 ? (2.0 * color.r * blend.r) : (1.0 - 2.0 * (1.0 - color.r) * (1.0 - blend.r));
                overlay.g = color.g < 0.5 ? (2.0 * color.g * blend.g) : (1.0 - 2.0 * (1.0 - color.g) * (1.0 - blend.g));
                overlay.b = color.b < 0.5 ? (2.0 * color.b * blend.b) : (1.0 - 2.0 * (1.0 - color.b) * (1.0 - blend.b));
                
                color.rgb = mix(color.rgb, overlay, u_GrainIntensity * 3.0);
            }

            // Apply EV multiplier
            color.rgb *= pow(2.0, u_Ev);

            // Apply White Balance
            float temp = u_WhiteBalance / 5000.0;
            vec3 wbMultiplier = vec3(temp, 1.0, 1.0 / temp);
            color.rgb *= wbMultiplier;

            gl_FragColor = color;
        }
    """

    const val FRAGMENT_SHADER_OES = """
        #extension GL_OES_EGL_image_external : require
        precision highp float;
        varying vec2 v_TexCoord;
        varying vec2 v_AberrationDirX;
        varying vec2 v_AberrationDirY;
        uniform samplerExternalOES u_Texture;
        
        uniform float u_Saturation;
        uniform float u_Contrast;
        uniform float u_AberrationIntensity;
        uniform int u_AberrationDirectionType;
        uniform float u_GrainIntensity;
        uniform float u_GrainChroma;
        uniform float u_GrainSize;
        uniform float u_GrainEnabled;
        uniform float u_Time;
        uniform vec2 u_Resolution;
        uniform float u_Ev;
        uniform float u_WhiteBalance;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec4 color = texture2D(u_Texture, v_TexCoord);
            
            float caAmount = u_AberrationIntensity * 0.01;
            if (caAmount > 0.0001) {
                vec2 dir;
                if (u_AberrationDirectionType == 0) {
                    dir = v_AberrationDirX;
                } else if (u_AberrationDirectionType == 1) {
                    dir = v_AberrationDirY;
                } else {
                    dir = normalize(v_TexCoord - vec2(0.5, 0.5));
                }
                float r = texture2D(u_Texture, v_TexCoord - dir * caAmount).r;
                float b = texture2D(u_Texture, v_TexCoord + dir * caAmount).b;
                color.r = r;
                color.b = b;
            }

            const vec3 luminanceWeighting = vec3(0.2126, 0.7152, 0.0722);
            float luminance = dot(color.rgb, luminanceWeighting);
            color.rgb = mix(vec3(luminance), color.rgb, u_Saturation);
            color.rgb = ((color.rgb - 0.5) * max(u_Contrast, 0.0)) + 0.5;

            if (u_GrainEnabled > 0.5 && u_GrainIntensity > 0.0) {
                vec2 grainCoord = (v_TexCoord * u_Resolution) / u_GrainSize;
                vec2 seed = floor(grainCoord) + vec2(u_Time * 1.5, u_Time * 0.5);
                float noiseR = hash(seed);
                vec3 blend;
                if (u_GrainChroma > 0.5) {
                    float noiseG = hash(seed + vec2(12.34, 56.78));
                    float noiseB = hash(seed + vec2(90.12, 34.56));
                    blend = vec3(noiseR, noiseG, noiseB);
                } else {
                    blend = vec3(noiseR);
                }
                
                vec3 overlay;
                overlay.r = color.r < 0.5 ? (2.0 * color.r * blend.r) : (1.0 - 2.0 * (1.0 - color.r) * (1.0 - blend.r));
                overlay.g = color.g < 0.5 ? (2.0 * color.g * blend.g) : (1.0 - 2.0 * (1.0 - color.g) * (1.0 - blend.g));
                overlay.b = color.b < 0.5 ? (2.0 * color.b * blend.b) : (1.0 - 2.0 * (1.0 - color.b) * (1.0 - blend.b));
                
                color.rgb = mix(color.rgb, overlay, u_GrainIntensity * 3.0);
            }
            
            // Apply EV multiplier (each 1 EV doubles/halves light)
            color.rgb *= pow(2.0, u_Ev);

            // Apply White Balance (Kelvin mapping approximation)
            // 5000 is neutral. Lower is cooler (blue), higher is warmer (orange/red).
            float temp = u_WhiteBalance / 5000.0;
            vec3 wbMultiplier = vec3(temp, 1.0, 1.0 / temp);
            color.rgb *= wbMultiplier;

            gl_FragColor = color;
        }
    """
}
