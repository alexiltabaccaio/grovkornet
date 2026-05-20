package com.grovkornet.nativefilmcamera.rendering.gl

import android.opengl.GLES20

class FboManager {
    var fboId = 0
        private set
    var fboTextureId = 0
        private set
    var fboWidth = 0
        private set
    var fboHeight = 0
        private set

    fun initFboIfNeeded(width: Int, height: Int, useNearest: Boolean) {
        if (width <= 0 || height <= 0) return
        if (fboWidth == width && fboHeight == height && fboId != 0) return

        release()

        val fbos = IntArray(1)
        val texs = IntArray(1)

        GLES20.glGenFramebuffers(1, fbos, 0)
        GLES20.glGenTextures(1, texs, 0)

        fboId = fbos[0]
        fboTextureId = texs[0]
        fboWidth = width
        fboHeight = height

        val filter = if (useNearest) GLES20.GL_NEAREST.toFloat() else GLES20.GL_LINEAR.toFloat()

        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, fboTextureId)
        GLES20.glTexImage2D(GLES20.GL_TEXTURE_2D, 0, GLES20.GL_RGBA, width, height, 0, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, null)
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, filter)
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, filter)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)

        GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fboId)
        GLES20.glFramebufferTexture2D(GLES20.GL_FRAMEBUFFER, GLES20.GL_COLOR_ATTACHMENT0, GLES20.GL_TEXTURE_2D, fboTextureId, 0)

        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0)
        GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0)
    }

    fun bind() {
        if (fboId != 0) {
            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fboId)
        }
    }

    fun unbind() {
        GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0)
    }

    fun release() {
        if (fboId != 0) {
            GLES20.glDeleteFramebuffers(1, intArrayOf(fboId), 0)
            fboId = 0
        }
        if (fboTextureId != 0) {
            GLES20.glDeleteTextures(1, intArrayOf(fboTextureId), 0)
            fboTextureId = 0
        }
        fboWidth = 0
        fboHeight = 0
    }
}
