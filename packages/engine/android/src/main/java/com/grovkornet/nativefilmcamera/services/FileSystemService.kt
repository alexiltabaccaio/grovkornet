package com.grovkornet.nativefilmcamera.services

import android.net.Uri
import java.io.File

object FileSystemService {
  fun deleteFile(
    uriString: String,
    uriParser: (String) -> Pair<String?, String?> = {
      val uri = Uri.parse(it)
      Pair(uri.scheme, uri.path)
    }
  ): Boolean {
    return try {
      val (scheme, path) = uriParser(uriString)
      if (scheme == "file") {
        if (path != null) {
          val file = File(path)
          if (file.exists()) {
            file.delete()
          } else {
            false
          }
        } else {
          false
        }
      } else {
        false
      }
    } catch (e: Exception) {
      false
    }
  }
}
