package com.grovkornet.nativefilmcamera.services

import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class FileSystemServiceTest {

    @get:Rule
    val tempFolder = TemporaryFolder()

    @Test
    fun deleteFile_nonExistentFile_returnsFalse() {
        val nonExistentPath = "file:///non/existent/path/file.jpg"
        // Test bypassing actual Uri parsing via lambda injection
        val result = FileSystemService.deleteFile(
            nonExistentPath,
            uriParser = { Pair("file", "/non/existent/path/file.jpg") }
        )
        assertFalse(result)
    }

    @Test
    fun deleteFile_existentFile_returnsTrueAndDeletes() {
        val tempFile = tempFolder.newFile("test_delete.jpg")
        assertTrue(tempFile.exists())

        val uriString = "file://${tempFile.absolutePath}"
        val result = FileSystemService.deleteFile(
            uriString,
            uriParser = { Pair("file", tempFile.absolutePath) }
        )
        assertTrue(result)
        assertFalse(tempFile.exists())
    }

    @Test
    fun deleteFile_invalidUri_returnsFalse() {
        val result = FileSystemService.deleteFile(
            "invalid_uri_string",
            uriParser = { Pair(null, null) }
        )
        assertFalse(result)
    }
}
