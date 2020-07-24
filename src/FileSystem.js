/* globals Wsh: false */

(function () {
  if (Wsh && Wsh.FileSystem) return;

  /**
   * This module takes charge of handling file and directory (similar to Node.js-FileSystem).
   *
   * @namespace FileSystem
   * @memberof Wsh
   * @requires {@link https://github.com/tuckn/WshOS|tuckn/WshOS}
   */
  Wsh.FileSystem = {};

  // Shorthands
  var CD = Wsh.Constants;
  var util = Wsh.Util;
  var fso = Wsh.FileSystemObject;
  var path = Wsh.Path;
  var os = Wsh.OS;

  var insp = util.inspect;
  var obtain = util.obtainPropVal;
  var isArray = util.isArray;
  var isNumber = util.isNumber;
  var isString = util.isString;
  var isSolidString = util.isSolidString;
  var parseDate = util.createDateString;
  var startsWith = util.startsWith;
  var endsWith = util.endsWith;
  var srrd = os.surroundPath;
  var XCOPY = os.exefiles.xcopy;

  var fs = Wsh.FileSystem;

  /** @constant {string} */
  var MODULE_TITLE = 'WshModeJs/FileSystem.js';

  /**
   * @function fs.throwTypeErrorNonExisting {{{
   * @param {string} moduleTitle
   * @param {string} functionName
   * @param {any} errVal
   */
  fs.throwTypeErrorNonExisting = function (moduleTitle, functionName, errVal) {
    throw new Error('Error: ENOENT: no such file or directory\n'
      + '  at ' + functionName + ' (' + moduleTitle + ')\n'
      + '  path: ' + insp(errVal));
  }; // }}}

  var throwErrNonExist = function (functionName, typeErrVal) {
    fs.throwTypeErrorNonExisting(MODULE_TITLE, functionName, typeErrVal);
  };

  var throwErrNonArray = function (functionName, typeErrVal) {
    util.throwTypeError('array', MODULE_TITLE, functionName, typeErrVal);
  };

  var throwErrNonStr = function (functionName, typeErrVal) {
    util.throwTypeError('string', MODULE_TITLE, functionName, typeErrVal);
  };

  // fs.constants {{{
  /**
   * Returns an object containing commonly used constants for file system operations. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_constants|Node.js-Path}.
   *
   * @namespace constants
   * @memberof Wsh.FileSystem
   */
  /** @lends Wsh.FileSystem.constants */
  fs.constants = {
    // File Access Constants
    /** @constant {number} */
    F_OK: 0,
    /** @constant {number} */
    R_OK: 4,
    /** @constant {number} */
    W_OK: 2,
    /** @constant {number} */
    X_OK: 1,
    // File Copy Constants
    /** @constant {number} */
    COPYFILE_EXCL: 1,
    // File Open Constants
    /** @constant {number} */
    O_RDONLY: 0,
    /** @constant {number} */
    O_WRONLY: 1,
    /** @constant {number} */
    O_RDWR: 2,
    /** @constant {number} */
    O_CREAT: 256,
    /** @constant {number} */
    O_EXCL: 1024,
    /** @constant {number} */
    O_TRUNC: 512,
    /** @constant {number} */
    O_APPEND: 8,
    // File Type Constants
    /** @constant {number} */
    S_IFMT: 61440,
    /** @constant {number} */
    S_IFREG: 32768,
    /** @constant {number} */
    S_IFDIR: 16384,
    /** @constant {number} */
    S_IFCHR: 8192,
    /** @constant {number} */
    S_IFLNK: 40960,
    // ?
    /** @constant {number} */
    UV_FS_COPYFILE_EXCL: 1
  }; // }}}

  // fs.inspectPathWhetherMAX_PATH {{{
  /**
   * Checks the length of a path. In the Windows API, the maximum length for a path is MAX_PATH, which is defined as 260 characters. {@link https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#maximum-path-length-limitation|Maximum Path Length Limitation}.
   *
   * @example
   * var tooLongPath = 'C:\\Users\\UserName\\AppData\\Roaming\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\ImplicitAppShortcuts\\database\\Document and Settings\\MongoDB Inc\\MongoDB Compass Community\\computer\\operationsManagement\\img\\01_original_screencapture-20180213T043515+0900.png';
   *
   * Wsh.FileSystem.inspectPathWhetherMAX_PATH(tooLongPath); // Throws an Error
   * @function inspectPathWhetherMAX_PATH
   * @memberof Wsh.FileSystem
   * @param {string} fullPath - The file-path to chekc.
   * @throws {string} - If a length of the file-path is over then 255.
   * @returns {void}
   */
  fs.inspectPathWhetherMAX_PATH = function (fullPath) {
    var FN = 'fs.inspectPathWhetherMAX_PATH';
    var pathLen = fullPath.length;
    if (pathLen > 255) {
      throw new Error('Error: [Too long file path!] Over 255 characters\n'
          + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
          + ' ' + pathLen + ' length "' + fullPath + '"');
    }
  }; // }}}

  // Create

  // fs.mkdirSync {{{
  /**
   * Synchronously creates the directory. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_mkdirsync_path_options|Node.js-Path}
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   *
   * fs.mkdirSync('D:\\MyDir');
   *
   * // The following does not work.
   * // Ex.1 The existing directory
   * fs.mkdirSync('D:\\MyDir'); // Throws an Error
   * // Ex.2 Non-existing parent directory
   * fs.mkdirSync('R:\\NonExistingDir\\NewDir'); // Throws an Error
   * @function mkdirSync
   * @memberof Wsh.FileSystem
   * @param {string} dirPath - The directory file path to create.
   * @param {object} [options] - Optional parameters.
   * @param {boolean} [options.isRecursive] - @TODO W.I.P
   * @returns {void}
   */
  fs.mkdirSync = function (dirPath/* , options */) {
    var FN = 'fs.mkdirSync';
    if (!isString(dirPath)) throwErrNonStr(FN, dirPath);

    fs.inspectPathWhetherMAX_PATH(dirPath);
    fso.CreateFolder(dirPath);
  }; // }}}

  // fs.writeFileSync {{{
  /**
   * Synchronously writes data to the file. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options|Node.js-Path}
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   * var writeData = 'Foo Bar';
   *
   * // The default is writing data to the file as binary (UTF-16 LE NoBOM)
   * fs.writeFileSync('D:\\MyData.bin', writeData);
   *
   * fs.writeFileSync('D:\\my-note.txt', writeData, { encoding: 'utf8' });
   *
   * fs.writeFileSync('D:\\MyNote.txt', writeData, { encoding: 'sjis' });
   *
   * fs.writeFileSync('D:\\my-script.wsf', writeData, {
   *   encoding: 'utf8', bom: true
   * });
   *
   * fs.writeFileSync('D:\\fixme.txt', '', { encoding: 'utf8' });
   * // Thorws a error! Fix this (T_T)
   * @function writeFileSync
   * @memberof Wsh.FileSystem
   * @param {string} fpath - The file-path to write.
   * @param {(string|Buffer)} data - Data of the file.
   * @param {object} [options] - Optional parameters.
   * @param {string} [options.encoding='binary'] - utf8(UTF-8), utf16(UTF-16 LE), sjis(Shift_JIS, CP932), All Charset -> HKEY_CLASSES_ROOT\Mime\Database\Charset\
   * @param {boolean} [options.bom=false] - true => enable, others => disable
   * @returns {void}
   */
  fs.writeFileSync = function (fpath, data, options) {
    var FN = 'fs.writeFileSync';
    if (!isString(fpath)) throwErrNonStr(FN, fpath);
    if (data === undefined) data = 'undefined'; // No error in Node.js

    var encoding = obtain(options, 'encoding', 'binary');
    var bom = obtain(options, 'bom', false);

    // @note Stringを.strm.Write()するとErrorとなる。WSHのString型の内部エンコードはUTF16LE？っぽいので、それ用にoptionsを切り替える
    if (/^bin(ary)?$/i.test(encoding) && isString(data)) {
      encoding = 'unicode';
      bom = false;
    }

    var strm = WScript.CreateObject('ADODB.Stream');

    /** -2146825284エラー ファイルへ書き込めませんでした。{@link https://stackoverflow.com/questions/16652896/adodb-stream-error-800a0bbc-write-to-file-failed} の対策用ダミーファイル。ダミー→本保存とすることで回避する */
    var fpathTmp = os.makeTmpPath();

    try {
      // Writing as binary
      if (/^bin(ary)?$/i.test(encoding)) {
        strm.Type = CD.ado.types.binary;
        // strm.Charset = CD.ado.charset.latin1; // 1 Byte character
        // strm.Type = CD.ado.types.text; // Write as 1 Byte text
        strm.Open();
        strm.Write(data);
        strm.SaveToFile(fpathTmp, CD.ado.saveCreates.overWrite);
        strm.Close();
        fs.copyFileSync(fpathTmp, fpath); // Save
        fs.unlinkSync(fpathTmp); // Delete the dummy file

        strm = null;
        return;
      }

      // Writing as text
      strm.Type = CD.ado.types.text;

      // Set character encoding
      if (/utf(-)?8/i.test(encoding)) {
        strm.Charset = CD.ado.charset.utf8;
      } else if (/utf(-)?16/i.test(encoding)) {
        strm.Charset = CD.ado.charset.utf16; // @note Unicode
      } else if (/(cp932|sjis|shift([-_])?jis)/i.test(encoding)) {
        strm.Charset = CD.ado.charset.sjis;
      } else {
        strm.Charset = encoding;
      }

      strm.Open();
      strm.WriteText(data);

      if (!/(utf-|unicode)/i.test(strm.Charset)) {
        strm.SaveToFile(fpathTmp, CD.ado.saveCreates.overWrite);
        strm.Close();
      } else if (bom) {
        /** CharasetがUTF系でWriteTextするとBOM付きで書き込まれるため、BOM付き指示があった場合は何もしない @todo support utf-7 */
        strm.SaveToFile(fpathTmp, CD.ado.saveCreates.overWrite);
        strm.Close();
      } else if (!bom) {
        // Remove BOM
        var bomLength = (strm.Charset === CD.ado.charset.utf8) ? 3 : 2;
        var strmNoBom = WScript.CreateObject('ADODB.Stream');
        var binNoBom;

        // バイナリモードにするためにPositionを一度0に戻す
        // Readするためにはバイナリタイプでないといけない
        strm.Position = 0;
        strm.Type = CD.ado.types.binary;
        // Positionに数値をいれると、そのByte分、先頭ポインタが移動する
        // 最初の2 or 3 Byteを飛ばして保存することでBOMを削除する
        strm.Position = bomLength;
        binNoBom = strm.Read(CD.ado.reads.all);
        // @TODO ここでSwapすればUTF16BEにも対応できる…が、今はいいや
        strm.Close();

        // 読み込んだバイナリデータをファイルに出力する
        strmNoBom.Type = CD.ado.types.binary;
        strmNoBom.Open();
        strmNoBom.Write(binNoBom);
        strmNoBom.SaveToFile(fpathTmp, CD.ado.saveCreates.overWrite);
        strmNoBom.Close();
      }

      fs.copyFileSync(fpathTmp, fpath); // Save
      fs.unlinkSync(fpathTmp); // Delete the dummy file

      strm = null;
    } catch (e) {
      throw new Error(insp(e) + '\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
        + '  file: "' + fpath + '"\n  encoding: "' + encoding + '"\n'
        + '  bom: "' + bom + '"\n  data: ' + data);
    }
  }; // }}}

  // fs.writeTmpFileSync {{{
  /**
   * Writes the data to a new temporary path, and Return the path.
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   * var writeData = 'Foo Bar';
   *
   * var tmpPath = fs.writeTmpFileSync(writeData, { encoding: 'utf8' });
   * // Returns: 'C:\\Users\\UserName\\AppData\\Local\\Temp\\fs-writeTmpFileSync_rad6E884.tmp'
   * @function writeTmpFileSync
   * @memberof Wsh.FileSystem
   * @param {string} data - The temporary data to write.
   * @param {object} [options] - See {@link Wsh.FileSystem.writeFileSync}
   * @returns {string} - The temporary file path.
   */
  fs.writeTmpFileSync = function (data, options) {
    var tmpFilePath = os.makeTmpPath('fs-writeTmpFileSync_');
    fs.writeFileSync(tmpFilePath, data, options);
    return tmpFilePath;
  }; // }}}

  // Read

  // fs.existsSync {{{
  /**
   * Returns true if the path exists, false otherwise. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_existssync_path|Node.js-Path}
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   *
   * fs.existsSync('D:\\ExistingDir'); // true
   * fs.existsSync('D:\\ExistingDir\\File.path'); // true
   * fs.existsSync('D:\\NonExistingDir\\File.path'); // false
   * fs.existsSync('\\\\MyComp\\Public\\ExistingDir\\File.path'); // true
   * @function existsSync
   * @memberof Wsh.FileSystem
   * @param {string} fpath - The file-path to check.
   * @returns {boolean} - If the file is existing returns true. else false.
   */
  fs.existsSync = function (fpath) {
    if (!isSolidString(fpath)) return false;
    fs.inspectPathWhetherMAX_PATH(fpath);

    return fso.FileExists(fpath) || fso.FolderExists(fpath);
  }; // }}}

  // fs.statSync {{{
  /**
   * Returns information about the file. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_statsync_path_options|Node.js-Path}
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   *
   * var stat = fs.statSync('D:\\My Dir\\File.path');
   * stat.isFile(); // true
   * stat.isDirectory(); // false
   * stat.isSymbolicLink(); // false
   *
   * var stat = fs.statSync('D:\\Symlink Dir');
   * stat.isFile(); // false
   * stat.isDirectory(); // true
   * stat.isSymbolicLink(); // true
   * @function statSync
   * @memberof Wsh.FileSystem
   * @param {string} fpath - The file-path to check.
   * @returns {object} - { isFile(), isDirectory(), isSymbolicLink() }
   */
  fs.statSync = function (fpath) {
    var FN = 'fs.statSync';
    if (!isString(fpath)) throwErrNonStr(FN, fpath);
    if (!fs.existsSync(fpath)) throwErrNonExist(FN, fpath);

    return {
      isFile: function () {
        return fso.FileExists(fpath);
      },
      isDirectory: function () {
        return fso.FolderExists(fpath);
      },
      isSymbolicLink: function () {
        var fObj;
        if (fso.FileExists(fpath)) {
          fObj = fso.GetFile(fpath);
        } else if (fso.FolderExists(fpath)) {
          fObj = fso.GetFolder(fpath);
        }
        var attr = fObj.Attributes + 0;
        /* global FILE_ATTRIBUTE_SYMLINKD_DIR, FILE_ATTRIBUTE_SYMLINKD_FILE */
        return (attr === FILE_ATTRIBUTE_SYMLINKD_DIR
            || attr === FILE_ATTRIBUTE_SYMLINKD_FILE);

        /**
         * Old code. Use fsutil {@link https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/cc753059(v=ws.11)|MS Docs}
         */
        // var exeCmd = 'fsutil reparsepoint query "' + fpath + '"';
        // var oExec = sh.execSync(exeCmd);
        //
        // return (oExec.stdout.indexOf(': Symbolic Link') !== -1);
      }
    };
  }; // }}}

  // fs.readFileSync {{{
  /**
   * Synchronously reads the entire contents of a file. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options|Node.js-Path}
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   *
   * var readBin = fs.readFileSync('D:\\MyPage\\index.html');
   * // The default is reading the file as binary
   *
   * var readHtml = fs.readFileSync('D:\\MyPage\\index.html', { encoding: 'utf8' });
   * var readText = fs.readFileSync('D:\\MyNote\\memo.txt', { encoding: 'sjis' });
   * @function readFileSync
   * @memberof Wsh.FileSystem
   * @param {string} fpath - The file-path to read.
   * @param {object} [options] - Optional parameters.
   * @param {string} [options.encoding='binary'] - latin1 (iso-8859-1), utf8, utf16, sjis (shift_jis, cp932), All Charset -> HKEY_CLASSES_ROOT\Mime\Database\Charset\
   * @param {boolean} [options.throws=true] - Whether throws an error or not when catch.
   * @returns {unknown|string} - 'unknown' is the result of the typeof judgment of JScript. Means binary?
   */
  fs.readFileSync = function (fpath, options) {
    var FN = 'fs.readFileSync';
    if (!isString(fpath)) throwErrNonStr(FN, fpath);
    if (!fs.statSync(fpath).isFile()) throwErrNonExist(FN, fpath);

    var encoding = obtain(options, 'encoding', 'binary');
    var throws = obtain(options, 'throws', true);
    var strm = WScript.CreateObject('ADODB.Stream');
    var data = '';

    try {
      if (/^bin(ary)?$/i.test(encoding)) {
        strm.Type = CD.ado.types.binary;
        strm.Open();
        strm.LoadFromFile(fpath);
        data = strm.Read(CD.ado.reads.all);
      } else {
        strm.Type = CD.ado.types.text;

        // Set character encoding
        if (/latin(-)?1/i.test(encoding)) {
          strm.Charset = CD.ado.charset.latin1;
        } else if (/utf(-)?8/i.test(encoding)) {
          strm.Charset = CD.ado.charset.utf8;
        } else if (/utf(-)?16/i.test(encoding)) {
          strm.Charset = CD.ado.charset.utf16; // @note Unicode
        } else if (/(cp932|sjis|shift([-_])?jis)/i.test(encoding)) {
          strm.Charset = CD.ado.charset.sjis;
        } else {
          strm.Charset = encoding;
        }

        strm.Open();
        strm.LoadFromFile(fpath);
        data = strm.ReadText(CD.ado.reads.all);
      }
      strm.Close();
    } catch (e) {
      if (throws) {
        throw new Error(insp(e) + '\n'
          + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
          + '  file: "' + fpath + '"\n  encoding: "' + encoding + '"\n');
      }
    }

    strm = null;
    return data;
  }; // }}}

  // fs.getChildrenFiles {{{
  /**
   * @typedef {object} typeGetChildrenFilesOptions
   * @property {string} [prefixDirName]
   * @property {boolean} [withFileTypes=false] - When false, the result is string[], like ['relative path1', 'relative path1', ...]. When true, the result is Object[], like [{ name: 'full path1', isDirectory: true} ...]
   * @property {boolean} [options.ignoresErr=false] - Even if an error occurs during processing, it will be ignored.
   * @property {boolean} [excludesSymlink=false] - Excluding symblic-links
   * @property {string} [matchedRegExp] - Ex. "\\w+\\.txt$"
   * @property {string} [ignoredRegExp] - Ex. "[_\\-.]cache\\d+"
   */

  /**
   * Gets files info in the specified directory.
   *
   * @function getChildrenFiles
   * @memberof Wsh.FileSystem
   * @param {string} dirPath - The directory path to read.
   * @param {typeGetChildrenFilesOptions} [options] - Optional parameters.
   * @returns {(string[]|Object[])}
   */
  fs.getChildrenFiles = function (dirPath, options) {
    var FN = 'fs.getChildrenFiles';
    if (!isString(dirPath)) throwErrNonStr(FN, dirPath);
    if (!fs.statSync(dirPath).isDirectory()) throwErrNonExist(FN, dirPath);

    var prefixDirName = obtain(options, 'prefixDirName', '');

    var matchedRegExp = obtain(options, 'matchedRegExp', null);
    var mtchRE = isSolidString(matchedRegExp) ? new RegExp(matchedRegExp, 'i') : null;

    var ignoredRegExp = obtain(options, 'ignoredRegExp', null);
    var ignrRE = isSolidString(ignoredRegExp) ? new RegExp(ignoredRegExp, 'i') : null;

    var ignoresErr = obtain(options, 'ignoresErr', false);
    var excludesSymlink = obtain(options, 'excludesSymlink', false);
    var withFileTypes = obtain(options, 'withFileTypes', false);

    var objDir = fso.GetFolder(path.normalize(dirPath));
    var enmFile = new Enumerator(objDir.Files);
    var files = [];
    var itm, filename, fullName, isSymlink, fileInfo;

    // @NOTE なるべくstatSyncとisSymbokickLinkをかまさないことで処理を軽くする
    for (enmFile.moveFirst(); !enmFile.atEnd(); enmFile.moveNext()) {
      itm = enmFile.item();
      filename = itm.Name.toString();
      fullName = path.join(prefixDirName, filename);

      if (mtchRE && !mtchRE.test(fullName)) continue;
      if (ignrRE && ignrRE.test(fullName)) continue;

      try {
        if (withFileTypes) {
          isSymlink = fs.statSync(itm.Path).isSymbolicLink();
          if (excludesSymlink && isSymlink) continue;

          fileInfo = {
            name: fullName,
            path: itm.Path,
            attributes: itm.Attributes,
            isDirectory: false,
            isFile: true,
            isSymbolicLink: isSymlink,
            size: itm.Size,
            // type: itm.Type, "ファイル フォルダー"しか取れない…？
            dateCreated: parseDate(null, new Date(itm.DateCreated)),
            dateModified: parseDate(null, new Date(itm.DateLastModified)) };
        } else {
          if (excludesSymlink && fs.statSync(itm.Path).isSymbolicLink()) {
            continue;
          }
          fileInfo = fullName;
        }

        files.push(fileInfo);
      } catch (e) {
        if (!ignoresErr) {
          throw new Error(insp(e) + '\n'
            + '  at ' + FN + ' (' + MODULE_TITLE + ')');
        } else {
          continue;
        }
      }
    }

    return files;
  }; // }}}

  // fs.getChildrenDirectories {{{
  /**
   * Gets directories info in the specified directory.
   *
   * @function getChildrenDirectories
   * @memberof Wsh.FileSystem
   * @param {string} dirPath - A directory path to read.
   * @param {typeGetChildrenFilesOptions} [options] - Optional parameters.
   * @returns {(string[]|Object[])}
   */
  fs.getChildrenDirectories = function (dirPath, options) {
    var FN = 'fs.getChildrenDirectories';
    if (!isString(dirPath)) throwErrNonStr(FN, dirPath);
    if (!fs.statSync(dirPath).isDirectory()) throwErrNonExist(FN, dirPath);

    var prefixDirName = obtain(options, 'prefixDirName', '');

    var matchedRegExp = obtain(options, 'matchedRegExp', null);
    var mtchRE = isSolidString(matchedRegExp) ? new RegExp(matchedRegExp, 'i') : null;

    var ignoredRegExp = obtain(options, 'ignoredRegExp', null);
    var ignrRE = isSolidString(ignoredRegExp) ? new RegExp(ignoredRegExp, 'i') : null;

    var ignoresErr = obtain(options, 'ignoresErr', false);
    var excludesSymlink = obtain(options, 'excludesSymlink', false);
    var withFileTypes = obtain(options, 'withFileTypes', false);

    var objDir = fso.GetFolder(path.normalize(dirPath));
    var enmDir = new Enumerator(objDir.SubFolders);
    var dirs = [];
    var itm, dirName, fullName, isSymlink, fileInfo;

    // @NOTE なるべくstatSyncとisSymbokickLinkをかまさないことで処理を軽くする
    for (enmDir.moveFirst(); !enmDir.atEnd(); enmDir.moveNext()) {
      itm = enmDir.item();
      dirName = itm.Name.toString();
      fullName = path.join(prefixDirName, dirName);

      if (mtchRE && !mtchRE.test(fullName)) continue;
      if (ignrRE && ignrRE.test(fullName)) continue;

      try {
        if (withFileTypes) {
          isSymlink = fs.statSync(itm.Path).isSymbolicLink();
          if (excludesSymlink && isSymlink) continue;

          fileInfo = {
            name: fullName,
            path: itm.Path,
            attributes: itm.Attributes,
            isDirectory: true,
            isFile: false,
            isSymbolicLink: isSymlink,
            dateCreated: parseDate(null, new Date(itm.DateCreated)),
            dateModified: parseDate(null, new Date(itm.DateLastModified)) };
        } else {
          if (excludesSymlink && fs.statSync(itm.Path).isSymbolicLink()) {
            continue;
          }
          fileInfo = fullName;
        }

        dirs.push(fileInfo);
      } catch (e) {
        if (!ignoresErr) {
          throw new Error(insp(e) + '\n'
            + '  at ' + FN + ' (' + MODULE_TITLE + ')');
        } else {
          continue;
        }
      }
    }

    return dirs;
  }; // }}}

  // fs.readdirSync {{{
  /**
   * @typedef {typeGetChildrenFilesOptions} typeReaddirSyncOptions
   * @property {boolean} [isOnlyFile=false]
   * @property {boolean} [isOnlyDir=false]
   */

  /**
   * Reads the contents of a directory. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_readdirsync_path_options|Node.js-Path}
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   *
   * var testDir = 'D:\\testDir';
   * //  D:\testDir\
   * //  │  fileRoot1.txt
   * //  │  fileRoot2-Symlink.log // <SYMLINKD>
   * //  │  fileRoot2.log
   * //  │
   * //  ├─DirBar\
   * //  ├─DirBar-Symlink\ // <SYMLINKD>
   * //  └─DirFoo\
   * //          fileFoo1.txt
   *
   * // Ex.1 No options
   * fs.readdirSync(testDir);
   * // Returns: [
   * //   'fileRoot1.txt',
   * //   'fileRoot2-Symlink.log', // <SYMLINKD>
   * //   'fileRoot2.log',
   * //   'DirBar',
   * //   'DirBar-Symlink', // <SYMLINKD>
   * //   'DirFoo' ]
   *
   * // Ex.2 Files only
   * fs.readdirSync(testDir, { isOnlyFile: true });
   * // Returns: [
   * //   'fileRoot1.txt',
   * //   'fileRoot2-Symlink.log', // <SYMLINKD>
   * //   'fileRoot2.log' ]
   *
   * // Ex.3 Directories only
   * fs.readdirSync(testDir, { isOnlyDir: true });
   * // Returns: [
   * //   'DirBar',
   * //   'DirBar-Symlink', // <SYMLINKD>
   * //   'DirFoo' ]
   *
   * // Ex.4 Excludes Symlink
   * fs.readdirSync(testDir, { excludesSymlink: true });
   * // Returns: [
   * //   'fileRoot1.txt',
   * //   'fileRoot2.log',
   * //   'DirBar',
   * //   'DirFoo' ]
   *
   * // Ex.5 Filtering
   * fs.readdirSync(testDir, { matchedRegExp: '\\d+\\.txt$' });
   * // Returns: ['fileRoot1.txt']
   *
   * // Ex.6 withFileTypes
   * fs.readdirSync(testDir, { withFileTypes: true });
   * // Returns: [
   * //   { name: 'fileRoot1.txt',
   * //     path: 'D:\\testDir\\fileRoot1.txt',
   * //     attributes: 32,
   * //     isDirectory: false,
   * //     isFile: true,
   * //     isSymbolicLink: false },
   * //   ...
   * //   ..
   * //   { name: 'DirFoo.txt',
   * //     path: 'D:\\testDir\\DirFoo',
   * //     attributes: 16,
   * //     isDirectory: true,
   * //     isFile: false,
   * //     isSymbolicLink: false }]
   * @function readdirSync
   * @memberof Wsh.FileSystem
   * @param {string} dirPath - The directory path to read.
   * @param {typeReaddirSyncOptions} [options] - Optional parameters.
   * @returns {(string[]|Object[])}
   */
  fs.readdirSync = function (dirPath, options) {
    var FN = 'fs.readdirSync';
    if (!isString(dirPath)) throwErrNonStr(FN, dirPath);
    if (!fs.statSync(dirPath).isDirectory()) throwErrNonExist(FN, dirPath);

    var isOnlyFile = obtain(options, 'isOnlyFile', false);
    var isOnlyDir = obtain(options, 'isOnlyDir', false);

    // File
    var files = [];
    if (!isOnlyDir) files = fs.getChildrenFiles(dirPath, options);

    // Directory
    var dirs = [];
    if (!isOnlyFile) dirs = fs.getChildrenDirectories(dirPath, options);

    return files.concat(dirs);
  }; // }}}

  // fs.excludeSymboliclinkPaths {{{
  /**
   * Excludes Symbolic-link paths from the list of file-path.
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   * var list = [
   *   'D:\\My Dir\\memo.txt',
   *   'D:\\MyBook-SymLink.xlsx', // SymbolicLink
   *   'D:\\image.png' ];
   *
   * var files = fs.excludeSymboliclinkPaths(list);
   * // Returns: [
   * //   'D:\\My Dir\\memo.txt',
   * //   'D:\\image.png' ];
   * @function excludeSymboliclinkPaths
   * @memberof Wsh.FileSystem
   * @param {string[]} filePaths - The list of file paths to check.
   * @param {object} [options] - Optional parameters.
   * @param {boolean} [options.ignoresErr=false] - Even if an error occurs during processing, it will be ignored.
   * @returns {string[]} - The list of file paths that excluded symlinks.
   */
  fs.excludeSymboliclinkPaths = function (filePaths, options) {
    var FN = 'fs.excludeSymboliclinkPaths';
    if (!isArray(filePaths)) throwErrNonArray(FN, filePaths);

    var ignoresErr = obtain(options, 'ignoresErr', false);
    var filteredDirPaths;
    var symlinkDirs = [];

    filteredDirPaths = filePaths.filter(function (fp) {
      for (var i = 0, len = symlinkDirs.length; i < len; i++) {
        if (startsWith(fp, symlinkDirs[i], 0, 'i')) return false;
      }

      try {
        var fstat = fs.statSync(fp);
        if (fstat.isSymbolicLink()) {
          if (fstat.isDirectory()) symlinkDirs.push(fp);
          return false;
        }
      } catch (e) {
        if (!ignoresErr) {
          throw new Error(insp(e) + '\n'
            + '  at ' + FN + ' (' + MODULE_TITLE + ')');
        }

        return false;
      }

      return true;
    });

    return filteredDirPaths;
  }; // }}}

  // fs.getAllChildrensFullPaths {{{
  /**
   * [Experimental] Creates a list of files in the directory with using `dir` instead of `fso.GetFolder`.
   *
   * @function getAllChildrensFullPaths
   * @memberof Wsh.FileSystem
   * @param {string} dirPath - The directory path to list.
   * @param {object} [options] - Optional parameters.
   * @param {boolean} [options.ignoresErr=false] - Even if an error occurs during processing, it will be ignored.
   * @param {boolean} [options.isOnlyDir=false]
   * @param {boolean} [options.excludesSymlink=false]
   * @returns {string[]} - The list of full file paths.
   */
  fs.getAllChildrensFullPaths = function (dirPath, options) {
    var FN = 'fs.getAllChildrensFullPaths';
    if (!isString(dirPath)) throwErrNonStr(FN, dirPath);
    if (!fs.statSync(dirPath).isDirectory()) throwErrNonExist(FN, dirPath);

    var mainCmd = 'dir';
    var args = [path.normalize(dirPath)];

    if (obtain(options, 'isOnlyDir', false)) {
      // List directory only
      args = args.concat(['/A:D', '/B', '/N', '/S', '/O:N']);
    } else {
      args = args.concat(['/B', '/N', '/S', '/O:N']);
    }

    var retObj = os.execSync(mainCmd, args, { shell: true });
    if (retObj.exitCode !== CD.runs.ok) {
      throw new Error('Error: [Error Exit Code]\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
        + '  mainCmd: ' + mainCmd + '\n  args: ' + insp(args) + '\n'
        + '  exitCode: ' + retObj.exitCode + '\n'
        + '  stdout: ' + retObj.stdout + '\n'
        + '  stderr: ' + retObj.stderr);
    }

    var fullPaths = retObj.stdout.split('\r\n');
    fullPaths.pop(); // Remove the last empty line

    if (obtain(options, 'excludesSymlink', false)) {
      return fullPaths;
    } else {
      // Exclude symboliclink paths (@FIXME Too slow)
      return fs.excludeSymboliclinkPaths(fullPaths, options);
    }
  }; // }}}

  // Update

  // fs.copyFileSync {{{
  /**
   * Synchronously copies src to dest. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_copyfilesync_src_dest_flags|Node.js-Path}
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   *
   * fs.copyFileSync('D:\\SrcFile.path', 'R:\\DestFile.path');
   *
   * // The following does not work.
   * // Ex.1 Directory
   * fs.copyFileSync('D:\\SrcDir', 'R:\\DestDir');
   * // Ex.2 Non-existing parent directory
   * fse.copySync('D:\\SrcFile.path', 'R:\\NonExistingDir\\DestFile.path');
   * @function copyFileSync
   * @memberof Wsh.FileSystem
   * @param {string} src - The source file path.
   * @param {string} dest - The destination file path.
   * @param {Wsh.FileSystem.constants.COPYFILE_EXCL} [flag]
   * @returns {void}
   */
  fs.copyFileSync = function (src, dest, flag) {
    var FN = 'fs.copyFileSync';
    if (!isString(src)) throwErrNonStr(FN, src);
    if (!isString(dest)) throwErrNonStr(FN, dest);
    if (!fs.existsSync(src)) throwErrNonExist(FN, src);

    if (flag === fs.constants.COPYFILE_EXCL && fs.existsSync(dest)) {
      throw new Error('Error: [EXIST]: file already exists\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
        + '  copyfile "' + src + '" -> "' + dest + '"');
    }

    try {
      fso.CopyFile(src, dest, CD.fso.overwrites.yes);
    } catch (e) {
      throw new Error(insp(e) + '\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
        + '  EPERM: operation not permitted, copyfile "' + src + '" -> "' + dest + '")');
    }
  }; // }}}

  // fs.linkSync {{{
  /**
   * [Requires admin rights] Creates a new link (also known as Symbolic Link) to an existing file. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_linksync_existingpath_newpath|Node.js-Path}
   *
   * @example
   * // Run this script as admin
   * var fs = Wsh.FileSystem; // Shorthand
   *
   * fs.linkSync('D:\\MyDir\\BackUp', 'C:\\BackUp-Symlink'); // Requires admin
   * @function linkSync
   * @memberof Wsh.FileSystem
   * @param {string} existingPath
   * @param {string} newPath
   * @param {object} [options] - Optional parameters.
   * @param {number} [options.msecTimeOut=10000] - default: 10sec
   * @param {boolean} [options.isDryRun=false] - No execute, returns the string of command.
   * @returns {boolean|string} - If isDryRun is true, returns string.
   */
  fs.linkSync = function (existingPath, newPath, options) {
    var FN = 'fs.linkSync';
    if (!isString(newPath)) throwErrNonStr(FN, newPath);
    if (!isString(existingPath)) throwErrNonStr(FN, existingPath);

    if (fs.existsSync(newPath)) {
      throw new Error('Error: [EXIST]: file of directory already exists\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
        + '  newPath "' + newPath + '"');
    }
    if (!fs.existsSync(existingPath)) throwErrNonExist(FN, existingPath);

    var mainCmd = 'mklink';
    var args = [];

    var statSrc = fs.statSync(existingPath);
    if (statSrc.isFile()) {
      args = args.concat([newPath, existingPath]);
    } else if (statSrc.isDirectory()) {
      args = args.concat(['/D', newPath, existingPath]);
    } else {
      throw new Error('Error: [Unknwon file type]:\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
        + '  existingPath "' + existingPath + '"');
    }

    var isDryRun = obtain(options, 'isDryRun', false);

    var retVal = os.runAsAdmin(mainCmd, args, {
      shell: true,
      winStyle: 'hidden',
      isDryRun: isDryRun
    });
    if (isDryRun) return 'dry-run [' + FN + ']: ' + retVal;

    /*
     * @note Cannot catch an error and a termination, if current process is not running as administrator. Therefore, wait 10 sec for existing the link.
     */

    var msecTimeOut = obtain(options, 'msecTimeOut', 10000);
    do {
      try {
        if (fs.existsSync(newPath)) return true;
      } catch (e) {
        WScript.Sleep(100);
        msecTimeOut -= 100;
      }
    } while (msecTimeOut > 0);

    return false;
  }; // }}}

  // fs.xcopySync {{{
  /**
   * Copies file with {@link https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/xcopy|xcopy}.
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   *
   * fs.xcopySync('D:\\SrcFile.path', 'R:\\DestFile.path');
   * fs.xcopySync('D:\\SrcDir', 'R:\\DestDir');
   *
   * var stdObj = fs.xcopySync('D:\\src.js', 'R:\\dest.js', { withStd: true });
   * // Returns: {
   * //   error: false,
   * //   exitCode: 0,
   * //   stdout: '<String of StdOut>',
   * //   stderr: '<String of StdErr>' }
   * @function xcopySync
   * @memberof Wsh.FileSystem
   * @param {string} src - The source file/directory path.
   * @param {string} dest - The destination file/directory path.
   * @param {object} [options] - Optional parameters.
   * @param {boolean} [options.withStd=false]
   * @param {boolean} [options.isDryRun=false] - No execute, returns the string of command.
   * @returns {void|typeExecSyncReturn|string} - If withStd is true returns {@link https://docs.tuckn.net/WshUtil/Wsh.Constants.windowStyles.html|Wsh.OS.typeExecSyncReturn} or if isDryRun is true, returns string.
   */
  fs.xcopySync = function (src, dest, options) {
    var FN = 'fs.xcopySync';
    if (!isString(src)) throwErrNonStr(FN, src);
    if (!isString(dest)) throwErrNonStr(FN, dest);
    if (!fs.existsSync(src)) throwErrNonExist(FN, src);

    var mainCmd = 'ECHO';

    var argStr = '';
    if (fs.statSync(src).isDirectory()) {
      argStr += ' D|' + XCOPY + ' ' + srrd(src) + ' ' + srrd(dest) + ' /E /I';
    } else {
      argStr += ' F|' + XCOPY + ' ' + srrd(src) + ' ' + srrd(dest);
    }

    argStr += ' /H /R /Y';

    // // debug
    // console.log(os.convToCmdCommand(mainCmd, argStr, { shell: true }));

    var withStd = obtain(options, 'withStd', false);
    var isDryRun = obtain(options, 'isDryRun', false);
    var retVal;

    if (!withStd) {
      retVal = os.runSync(mainCmd, argStr, {
        shell: true,
        winStyle: 'hidden',
        isDryRun: isDryRun
      });

      if (isDryRun) return 'dry-run [' + FN + ']: ' + retVal;
      if (retVal === CD.runs.ok) return;

      throw new Error('Error [ExitCode is not Ok] "' + retVal + '"\n');
    } else {
      retVal = os.execSync(mainCmd, argStr, {
        shell: true,
        isDryRun: isDryRun
      });

      if (isDryRun) return 'dry-run [' + FN + ']: ' + retVal;
      if (retVal.exitCode === CD.runs.ok) return retVal;

      throw new Error('Error: [Error Exit Code]\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
        + '  mainCmd: ' + mainCmd + '\n  argStr: ' + argStr + '\n'
        + '  exitCode: ' + retVal.exitCode + '\n'
        + '  stdout: ' + retVal.stdout + '\n'
        + '  stderr: ' + retVal.stderr);
    }
  }; // }}}

  // Delete

  // fs.rmdirSync {{{
  /**
   * Removes the directory. Can not remove a file. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_rmdirsync_path|Node.js-Path}
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   *
   * fs.rmdirSync('D:\\MyDir');
   *
   * // The following does not work.
   * // Ex.1 File
   * fs.rmdirSync('D:\\MyFile.path');
   * // Ex.2 A non-existing directory
   * fs.mkdirSync('R:\\NonExistingDir');
   * @function rmdirSync
   * @memberof Wsh.FileSystem
   * @param {string} dirPath - The directory path to delete.
   * @returns {void}
   */
  fs.rmdirSync = function (dirPath) {
    var FN = 'fs.rmdirSync';
    if (!isString(dirPath)) throwErrNonStr(FN, dirPath);
    if (!fs.statSync(dirPath).isDirectory()) throwErrNonExist(FN, dirPath);

    try {
      fso.DeleteFolder(dirPath, CD.fso.force.yes);
    } catch (e) {
      /**
       * fso.DeleteFolder can not delete the directory including symlinks? On the other hand, `rmdir` can delete a directory including symlinks, If its name has the last backslash.
       * [ATTENTION] But! If it is the symlink directory, `rmdir` will even delete the files from which the link originated
       */
      try {
        if (!endsWith(dirPath, path.sep)) dirPath += path.sep;

        var retVal = os.runSync('rmdir', ['/S', '/Q', dirPath], {
          shell: true,
          winStyle: 'hidden'
        });

        if (retVal === CD.runs.ok) return;

        throw new Error('Error [ExitCode is not Ok] "' + retVal + '"\n');
      } catch (e) {
        throw new Error(insp(e) + '\n'
          + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
          + '  EPERM: operation not permitted, "' + dirPath + '"');
      }
    }
  }; // }}}

  // fs.unlinkSync {{{
  /**
   * Removes the file with {@link https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/deletefile-method|DeleteFile method}. Can not remove a directory. Similar to {@link https://nodejs.org/api/fs.html#fs_fs_unlinksync_path|Node.js-Path}
   *
   * @example
   * var fs = Wsh.FileSystem; // Shorthand
   *
   * fs.unlinkSync('D:\\MyFile.path');
   * fs.unlinkSync('D:\\MyDir'); // Throws an Error
   * @function unlinkSync
   * @memberof Wsh.FileSystem
   * @param {string} fpath - The file-path to remove.
   * @returns {void}
   */
  fs.unlinkSync = function (fpath) {
    var FN = 'fs.unlinkSync';
    if (!isString(fpath)) throwErrNonStr(FN, fpath);
    if (!fs.statSync(fpath).isFile()) throwErrNonExist(FN, fpath);

    try {
      fso.DeleteFile(fpath, CD.fso.force.yes);
    } catch (e) {
      throw new Error(insp(e) + '\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
        + '  EPERM: operation not permitted, unlink "' + fpath + '"');
    }
  }; // }}}
})();

// vim:set foldmethod=marker commentstring=//%s :
