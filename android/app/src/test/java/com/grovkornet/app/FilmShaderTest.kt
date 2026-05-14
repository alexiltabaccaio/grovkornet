package com.grovkornet.app

import org.junit.Test
import org.junit.Assert.*

class FilmShaderTest {

    @Test
    fun vertexShader_containsRequiredAttributes() {
        val shader = FilmShader.VERTEX_SHADER
        assertTrue("Vertex shader should contain a_Position", shader.contains("attribute vec4 a_Position;"))
        assertTrue("Vertex shader should contain a_TexCoord", shader.contains("attribute vec4 a_TexCoord;"))
        assertTrue("Vertex shader should contain u_TransformMatrix", shader.contains("uniform mat4 u_TransformMatrix;"))
    }

    @Test
    fun fragmentShader_containsRequiredUniforms() {
        val shader = FilmShader.FRAGMENT_SHADER
        assertTrue(shader.contains("uniform float u_Saturation;"))
        assertTrue(shader.contains("uniform float u_Contrast;"))
        assertTrue(shader.contains("uniform float u_AberrationIntensity;"))
        assertTrue(shader.contains("uniform float u_GrainIntensity;"))
        assertTrue(shader.contains("uniform float u_GrainEnabled;"))
        assertTrue(shader.contains("uniform vec2 u_Resolution;"))
    }

    @Test
    fun fragmentShaderOes_containsRequiredExtensionAndUniforms() {
        val shader = FilmShader.FRAGMENT_SHADER_OES
        assertTrue(shader.contains("#extension GL_OES_EGL_image_external : require"))
        assertTrue(shader.contains("uniform samplerExternalOES u_Texture;"))
        assertTrue(shader.contains("uniform float u_Saturation;"))
        assertTrue(shader.contains("uniform float u_Contrast;"))
    }
}
