package com.anonymous.Grovkornet

object FilmShader {
    const val VERTEX_SHADER = """
        attribute vec4 a_Position;
        attribute vec4 a_TexCoord;
        uniform mat4 u_TransformMatrix;
        varying vec2 v_TexCoord;
        void main() {
            gl_Position = a_Position;
            v_TexCoord = (u_TransformMatrix * a_TexCoord).xy;
        }
    """

    const val FRAGMENT_SHADER = """
        precision highp float;
        varying vec2 v_TexCoord;
        uniform sampler2D u_Texture;
        
        uniform float u_Saturation;
        uniform float u_Contrast;
        uniform float u_AberrationIntensity;
        uniform float u_GrainIntensity;
        uniform float u_GrainEnabled;
        uniform float u_Time;
        uniform vec2 u_Resolution;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec4 color = texture2D(u_Texture, v_TexCoord);
            
            // 1. Chromatic Aberration
            float caAmount = u_AberrationIntensity * 0.01; // Scaled for normalized coords
            if (caAmount > 0.0001) {
                float r = texture2D(u_Texture, vec2(v_TexCoord.x - caAmount, v_TexCoord.y)).r;
                float b = texture2D(u_Texture, vec2(v_TexCoord.x + caAmount, v_TexCoord.y)).b;
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
                float noise = hash(v_TexCoord * u_Resolution + vec2(u_Time, u_Time * 0.5));
                vec3 blend = vec3(noise);
                
                vec3 overlay;
                overlay.r = color.r < 0.5 ? (2.0 * color.r * blend.r) : (1.0 - 2.0 * (1.0 - color.r) * (1.0 - blend.r));
                overlay.g = color.g < 0.5 ? (2.0 * color.g * blend.g) : (1.0 - 2.0 * (1.0 - color.g) * (1.0 - blend.g));
                overlay.b = color.b < 0.5 ? (2.0 * color.b * blend.b) : (1.0 - 2.0 * (1.0 - color.b) * (1.0 - blend.b));
                
                color.rgb = mix(color.rgb, overlay, u_GrainIntensity * 2.0);
            }

            gl_FragColor = color;
        }
    """

    const val FRAGMENT_SHADER_OES = """
        #extension GL_OES_EGL_image_external : require
        precision highp float;
        varying vec2 v_TexCoord;
        uniform samplerExternalOES u_Texture;
        
        uniform float u_Saturation;
        uniform float u_Contrast;
        uniform float u_AberrationIntensity;
        uniform float u_GrainIntensity;
        uniform float u_GrainEnabled;
        uniform float u_Time;
        uniform vec2 u_Resolution;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec4 color = texture2D(u_Texture, v_TexCoord);
            
            float caAmount = u_AberrationIntensity * 0.01;
            if (caAmount > 0.0001) {
                float r = texture2D(u_Texture, vec2(v_TexCoord.x - caAmount, v_TexCoord.y)).r;
                float b = texture2D(u_Texture, vec2(v_TexCoord.x + caAmount, v_TexCoord.y)).b;
                color.r = r;
                color.b = b;
            }

            const vec3 luminanceWeighting = vec3(0.2126, 0.7152, 0.0722);
            float luminance = dot(color.rgb, luminanceWeighting);
            color.rgb = mix(vec3(luminance), color.rgb, u_Saturation);
            color.rgb = ((color.rgb - 0.5) * max(u_Contrast, 0.0)) + 0.5;

            if (u_GrainEnabled > 0.5 && u_GrainIntensity > 0.0) {
                float noise = hash(v_TexCoord * u_Resolution + vec2(u_Time, u_Time * 0.5));
                vec3 blend = vec3(noise);
                
                vec3 overlay;
                overlay.r = color.r < 0.5 ? (2.0 * color.r * blend.r) : (1.0 - 2.0 * (1.0 - color.r) * (1.0 - blend.r));
                overlay.g = color.g < 0.5 ? (2.0 * color.g * blend.g) : (1.0 - 2.0 * (1.0 - color.g) * (1.0 - blend.g));
                overlay.b = color.b < 0.5 ? (2.0 * color.b * blend.b) : (1.0 - 2.0 * (1.0 - color.b) * (1.0 - blend.b));
                
                color.rgb = mix(color.rgb, overlay, u_GrainIntensity * 2.0);
            }

            gl_FragColor = color;
        }
    """
}
