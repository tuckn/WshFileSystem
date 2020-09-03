/* globals Wsh: false */
/* globals __dirname: false */

(function () {
  /**
   * This module extend charge of handling file and directory (similar to Node.js-FileSystem).
   *
   * @namespace FileSystemExtra
   * @memberof Wsh
   * @requires {@link https://github.com/tuckn/WshOS|tuckn/WshOS}
   * @requires ./FileSystem.js
   */
  Wsh.FileSystemExtra = {};

  // Shorthands
  var CD = Wsh.Constants;
  var util = Wsh.Util;
  var fso = Wsh.FileSystemObject;
  var path = Wsh.Path;
  var shApp = Wsh.ShellApplication;
  var os = Wsh.OS;
  var fs = Wsh.FileSystem;

  var objAdd = Object.assign;
  var obtain = util.obtainPropVal;
  var isSolidArray = util.isSolidArray;
  var isSolidString = util.isSolidString;
  var isFunction = util.isFunction;
  var isString = util.isString;
  var hasContent = util.hasContent;
  var hasIn = util.hasIn;
  var insp = util.inspect;
  var srrd = os.surroundPath;
  var CERTUTIL = os.exefiles.certutil;

  var fse = Wsh.FileSystemExtra;

  /** @constant {string} */
  var MODULE_TITLE = 'WshModeJs/FileSystemExtra.js';

  var throwErrNonArray = function (functionName, typeErrVal) {
    util.throwTypeError('array', MODULE_TITLE, functionName, typeErrVal);
  };

  var throwErrNonStr = function (functionName, typeErrVal) {
    util.throwTypeError('string', MODULE_TITLE, functionName, typeErrVal);
  };

  var throwErrNonExist = function (functionName, typeErrVal) {
    fs.throwTypeErrorNonExisting(MODULE_TITLE, functionName, typeErrVal);
  };

  // fse.ensureDirSync {{{
  /**
   * Ensures that the directory exists. If the directory structure does not exist, it is created. Similar to {@link https://github.com/jprichardson/node-fs-extra/blob/master/docs/emptyDir-sync.md|npm jprichardson/fs-extra}
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * fse.ensureDirSync('D:\\MyDir');
   * fse.ensureDirSync('D:\\MyDir'); // No Error
   * fse.ensureDirSync('R:\\NonExistingDir\\NewDir'); // Creates 2 directories
   * @function ensureDirSync
   * @memberof Wsh.FileSystemExtra
   * @param {string} dirPath - The directory path to check and create.
   * @returns {void}
   */
  fse.ensureDirSync = function (dirPath) {
    var FN = 'fse.ensureDirSync';
    if (!isString(dirPath)) throwErrNonStr(FN, dirPath);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) return;

    var dirFullPath = path.normalize(dirPath);
    var layers = dirFullPath.split(path.sep);
    var layer = '';
    var startIndex = 0;

    // Set the root path
    if (path.isUNC(dirFullPath)) {
      layer = '\\\\' + layers[2]; // Because [0] and [1] is empty.
      startIndex = 3;
    } else {
      layer = layers[0]; // Stores a drive letter
      startIndex = 1;
    }

    // Create directories
    for (var i = startIndex, I = layers.length; i < I; i++) {
      layer += path.sep + layers[i];

      try {
        if (!fs.existsSync(layer)) {
          fs.mkdirSync(layer);
        } else if (fs.statSync(layer).isDirectory()) {
          continue;
        } else {
          fs.mkdirSync(layer);
        }
      } catch (e) {
        throw new Error(insp(e) + '\n'
            + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
            + '  Failed to create the directory "' + layer + '".\n'
            + '  dirPath: "' + dirPath + '"');
      }
    }
  }; // }}}

  // fse.copySync {{{
  /**
   * Copies the file or directory. Similar to {@link https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy-sync.md|npm jprichardson/fs-extra}
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * // File
   * fse.copySync('D:\\SrcFile.path', 'R:\\DestFile.path');
   *
   * // Auto creating directory
   * fse.copySync('D:\\SrcFile.path', 'R:\\NonExistingDir\\DestFile.path');
   *
   * // Directory
   * var src = 'D:\\SrcDir';
   * var dest = 'R:\\DestDir';
   * fse.copySync(src, dest);
   * // Note: Copy everything inside of this directory,
   * //   not the entire directory itself.
   * // If you want to copy even the directory itself do the following
   * var path = Wsh.Path;
   * fse.copySync(src, path.join(dest, path.basename(src)));
   * @function copySync
   * @memberof Wsh.FileSystemExtra
   * @param {string} src - Note that if src is a directory it will copy everything inside of this directory, not the entire directory itself.
   * @param {string} dest
   * @param {object} [options] - Optional parameters.
   * @param {boolean} [options.overwrite=true] - Overwrite existing file or directory.
   * @param {boolean} [options.errorOnExist=false] - When `overwrite` is false and the destination exists, throw an error.
   * @param {Function} [options.filter] - Return true to copy, false to not.
   * @returns {void}
   */
  fse.copySync = function (src, dest, options) {
    var FN = 'fse.copySync';
    if (!isString(src)) throwErrNonStr(FN, src);
    if (!isString(dest)) throwErrNonStr(FN, dest);
    if (!fs.existsSync(src)) throwErrNonExist(FN, src);

    var filter = obtain(options, 'filter', null);
    if (isFunction(filter) && !filter(src, dest)) return;

    var overwrite = obtain(options, 'overwrite', true);
    var errorOnExist = obtain(options, 'errorOnExist', false);

    if (!overwrite && fs.existsSync(dest)) {
      if (errorOnExist) {
        throw new Error('Error: [Already Existing] "' + dest + '"/n'
          + '  at ' + FN + ' (' + MODULE_TITLE + ')');
      }
      return;
    }

    try {
      // Create directories
      fse.ensureDirSync(path.dirname(dest));

      // Copy
      var fsstat = fs.statSync(src);
      if (fsstat.isFile()) {
        fso.CopyFile(src, dest, CD.fso.overwrites.yes);
      } else if (fsstat.isDirectory()) {
        fso.CopyFolder(src, dest, CD.fso.overwrites.yes);
      } else {
        throw new Error('ENOENT: no such file or directory, "' + src + '"\n'
          + '  at ' + FN + ' (' + MODULE_TITLE + ')');
      }
    } catch (e) {
      throw new Error(insp(e) + '\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
        + '  src: "' + src + '" -> dest: "' + dest + '"');
    }
  }; // }}}

  // fse.unzipOfficeOpenXML {{{
  /**
   * Copies files from a directory/zip with Shell.Application. Can also extract a zip file.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * fse.unzipOfficeOpenXML('D:\\MyBook.xlsx', 'R:\\DestDir');
   * // Result:
   * //  D:\DestDir\
   * //  └─ MyBook.xlsx\
   * //       ├─ ooxml\
   * //       ├─ docProps\
   * //       ├─ xl\
   * //       │  ├─ theme\
   * //       │  ├─ worksheets\
   * //       │  └─ _rels\
   * //       └─ _rels\
   * @function unzipOfficeOpenXML
   * @memberof Wsh.FileSystemExtra
   * @param {string} srcPath - The source OOXML file (e.g. xlsx, docx).
   * @param {string} destDir - The destination directory path.
   * @returns {string} - The directory path to unzip.
   */
  fse.unzipOfficeOpenXML = function (srcPath, destDir) {
    var FN = 'fse.unzipOfficeOpenXML';
    if (!isSolidString(srcPath)) throwErrNonStr(FN, srcPath);
    if (!isSolidString(destDir)) throwErrNonStr(FN, destDir);
    if (!fs.existsSync(srcPath)) throwErrNonExist(FN, srcPath);

    // Create temp dest
    var tmpDir = os.makeTmpPath('fse-unzipOfficeOpenXML_');
    fs.mkdirSync(tmpDir);

    // Copies ooxmls to tmp and renames to .zip
    var srcZipTmp = path.join(tmpDir, path.basename(srcPath) + '.zip');
    fs.copyFileSync(srcPath, srcZipTmp);

    // Create temp dest
    var destDirTmp = path.join(tmpDir, path.basename(srcPath));
    fs.mkdirSync(destDirTmp);

    /**
     * Copies an item or items to a directory. {@link https://docs.microsoft.com/en-us/windows/desktop/api/shldisp/nf-shldisp-folder-copyhere|Microsoft Docs}
     *
     * @function Folder.CopyHere
     * @memberof Wsh.ShellApplication
     * @param [Variant] vItem - The item or items to copy. This can be a string that represents a file name, a FolderItem object, or a FolderItems object.
     * @param [Variant] vOptions - Options for the copy operation. This value can be zero or a combination of the following values. These values are based upon flags defined for use with the fFlags member of the C++ SHFILEOPSTRUCT structure. Each Shell namespace must provide its own implementation of these flags, and each namespace can choose to ignore some or even all of these flags. These flags are not defined by name for Visual Basic, VBScript, or JScript, so you must define them yourself or use their numeric equivalents.
        Note  In some cases, such as compressed (.zip) files, some option flags may be ignored by design.
        (4) Do not display a progress dialog box.
        (8) Give the file being operated on a new name in a move, copy,
            or rename operation if a file with the target name already exists.
        (16) Respond with "Yes to All" for any dialog box that is displayed.
        (64) Preserve undo information, if possible.
        (128) Perform the operation on files only if a wildcard file name (*.*)
            is specified.
        (256) Display a progress dialog box but do not show the file names.
        (512) Do not confirm the creation of a new directory if the operation
            requires one to be created.
        (1024) Do not display a user interface if an error occurs.
        (2048) Version 4.71. Do not copy the security attributes of the file.
        (4096) Only operate in the local directory. Do not operate recursively
            into subdirectories.
        (8192) Version 5.0. Do not copy connected files as a group. Only copy
            the specified files.
     */
    var objInput = shApp.NameSpace(srcZipTmp);
    var objOutput = shApp.NameSpace(destDirTmp);
    objOutput.CopyHere(objInput.Items(), 16); // 16: "Yes to All"

    var dirToUnzip = path.join(destDir, path.basename(destDirTmp));
    fse.copySync(destDirTmp, dirToUnzip);
    // Cleans
    fse.removeSync(tmpDir);

    return dirToUnzip;
  }; // }}}

  // fse.removeSync  {{{
  /**
   * Removes the file or directory. Similar to {@link https://github.com/jprichardson/node-fs-extra/blob/master/docs/remove-sync.md|npm jprichardson/fs-extra}
   *
   * @example
   * var fse = Wsh.FileSystem; // Shorthand
   *
   * // File
   * fse.removeSync('D:\\MyFile.path');
   *
   * // Directory
   * fse.removeSync('D:\\MyDir');
   *
   * // A non-existing directory (Non error)
   * fse.removeSync('R:\\NonExistingDir');
   * @function removeSync
   * @memberof Wsh.FileSystemExtra
   * @param {string} fpath - The file path to remove.
   * @returns {void}
   */
  fse.removeSync = function (fpath) {
    var FN = 'fse.removeSync';
    if (!isString(fpath)) throwErrNonStr(FN, fpath);
    if (!fs.existsSync(fpath)) return;

    try {
      var fsstat = fs.statSync(fpath);

      if (fsstat.isFile()) {
        fs.unlinkSync(fpath);
      } else if (fsstat.isDirectory()) {
        fs.rmdirSync(fpath);
      } else {
        throw new Error('ENOENT: no such file or directory, "' + fpath + '"\n'
          + '  at ' + FN + ' (' + MODULE_TITLE + ')');
      }
    } catch (e) {
      throw new Error(insp(e) + ' Failed to delete "' + fpath + '"\n'
        + '  at ' + FN + ' (' + MODULE_TITLE + ')');
    }
  }; // }}}

  // fse.ensureReadingFile  {{{
  /**
   * Reads the file with {@link Wsh.FileSystem.readFileSync}. If the reading fails, it will retry to read for the specified number of seconds.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * var readBin = fse.ensureReadingFile('D:\\logger.log', 5000);
   * // Retry for 5sec
   * @function ensureReadingFile
   * @memberof Wsh.FileSystemExtra
   * @param {string} fpath - The file path to read.
   * @param {number} [msecTimeOut=10000] - default: 10sec. 0 to not timeout.
   * @param {object} [options] - See {@link Wsh.FileSystem.readFileSync options}.
   * @returns {number}
   */
  fse.ensureReadingFile = function (fpath, msecTimeOut, options) {
    if (!hasContent(msecTimeOut)) msecTimeOut = 10000;

    var isInfinity = (msecTimeOut === 0);
    var fileData;
    var isRead = false;

    do {
      try {
        fileData = fs.readFileSync(fpath, objAdd({}, options, { throws: true }));
        isRead = true;
      } catch (e) {
        msecTimeOut -= 300;
        if (!isInfinity && msecTimeOut <= 0) throw e;
        WScript.Sleep(300);
      }
    } while (!isRead && (isInfinity || msecTimeOut > 0));

    return fileData;
  }; // }}}

  // fse.ensureRemovingFile  {{{
  /**
   * Ensure to delete a file. 失敗してもリトライし時間経過で諦める
   * @function ensureRemovingFile
   * @memberof Wsh.FileSystemExtra
   * @param {string} fpath
   * @param {number} [msecTimeOut=30000] - default: 30sec
   * @returns {boolean}
   */
  fse.ensureRemovingFile = function (fpath, msecTimeOut) {
    if (!fs.existsSync(fpath)) return true;
    if (!fs.statSync(fpath).isFile()) return true;

    if (!hasContent(msecTimeOut)) msecTimeOut = 30000;
    var SLEEP_INTERVAL_MSEC = 300; // 300msec

    do {
      try {
        fso.DeleteFile(fpath, CD.fso.force.yes);
      } catch (e) {
        WScript.Sleep(SLEEP_INTERVAL_MSEC);
        msecTimeOut -= SLEEP_INTERVAL_MSEC;
      }
    } while (fso.FileExists(fpath) && msecTimeOut > 0);

    if (msecTimeOut > 0) return true;
    return false;
  }; // }}}

  // fse.writeJsonSync  {{{
  /**
   * Writes the Object to the JSON file.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   * var testObj = {
   *   array: [1, 2, 3],
   *   bool: false,
   *   float: 3.14,
   *   num: 42,
   *   obj: { a: 'A' },
   *   str: 'Some string',
   *   nu: null
   * };
   *
   * fse.writeJsonSync('D:\\test.json', testObj);
   *
   * fse.writeJsonSync('D:\\test_sjis.json', testObj, {
   *   indent: '  ',
   *   lineEnding: '\r\n',
   *   encoding: 'sjis'
   * });
   * @function writeJsonSync
   * @memberof Wsh.FileSystemExtra
   * @param {string} fpJson - The destination JSON path.
   * @param {object} obj - The object to write.
   * @param {object} [options] - Optional parameters.
   * @param {string} [options.indent=4] - "" to 1 liner code(No line break). See space parameter in {@link https://docs.tuckn.net/WshPolyfill/JSON.html#.stringify|JSON.stringify options}
   * @param {string} [options.lineEnding='\n'] - The character of line-ending.
   * @param {string} [options.encoding='utf-8'] - utf8(UTF-8), utf16(UTF-16 LE), sjis(Shift_JIS, CP932), All Charset -> HKEY_CLASSES_ROOT\Mime\Database\Charset\
   * @param {boolean} [options.bom] - true => enable, others => disable
   * @returns {void}
   */
  fse.writeJsonSync = function (fpJson, obj, options) {
    var FN = 'fse.writeJsonSync';
    if (!isString(fpJson)) throwErrNonStr(FN, fpJson);

    // @note 空白""も受け入れるため、obtainは使用しない
    var indent = hasIn(options, 'indent') ? options.indent : 4;
    if (indent === null || indent === undefined) indent = 4;

    var txtJson = JSON.stringify(obj, null, indent);

    var lineEnding = obtain(options, 'lineEnding', '\n');
    // @note JSON.stringifyは常に\nで改行する（indent=""以外）
    if (lineEnding !== '\n') txtJson = txtJson.replace(/\n/g, lineEnding);

    var encoding = obtain(options, 'encoding', CD.ado.charset.utf8);
    var bom = obtain(options, 'bom', false);
    fs.writeFileSync(fpJson, txtJson, { encoding: encoding, bom: bom });
  }; // }}}

  // fse.readJsonSync  {{{
  /**
   * Gets an Object from the JSON file.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * var readObj = fse.readJsonSync('D:\\settings.json');
   * // Returns: {
   * //   array: [1, 2, 3],
   * //   bool: false,
   * //   float: 3.14,
   * //   num: 42,
   * //   obj: { a: 'A' },
   * //   str: 'Some string',
   * //   nu: null }
   * @function readJsonSync
   * @memberof Wsh.FileSystemExtra
   * @param {string} fpJson - The .json file path to read.
   * @param {object} [options] - Optional parameters.
   * @param {string} [options.encoding='utf-8'] - latin1 (iso-8859-1), utf8, utf16, sjis (shift_jis, cp932), All Charset -> HKEY_CLASSES_ROOT\Mime\Database\Charset\
   * @param {boolean} [options.throws=true] - Whether throws an error or not when catch.
   * @returns {any}
   */
  fse.readJsonSync = function (fpJson, options) {
    var FN = 'fse.readJsonSync';
    if (!isString(fpJson)) throwErrNonStr(FN, fpJson);
    if (!fs.statSync(fpJson).isFile()) throwErrNonExist(FN, fpJson);

    var encoding = obtain(options, 'encoding', CD.ado.charset.utf8);
    var throws = obtain(options, 'throws', true);
    var txtJson = fs.readFileSync(fpJson, { encoding: encoding, throws: throws });

    var rtnAssoc = {};
    if (txtJson) rtnAssoc = JSON.parse(txtJson);

    return rtnAssoc;
  }; // }}}

  // fse.writeCsvSync  {{{
  /**
   * Writes the two dimensions array to the CSV file.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   * var testArray = [
   *   ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
   *   ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
   *   ['2020/1/1', '\'007', 'Has Space', '日本語', 'I say "Yes!"', 'Line\nBreak', 'Foo,Bar,Baz'],
   *   ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']
   * ];
   *
   * // Ex.1 The default writing option is utf-8 BOM for Excel.
   * fse.writeCsvSync('D:\\test.csv', testArray);
   *
   * // Ex.2 Write as Shift_JIS
   * fse.writeCsvSync('D:\\test_sjis.csv', testArray, { encoding: 'sjis' });
   * @function writeCsvSync
   * @memberof Wsh.FileSystemExtra
   * @param {string} csvpath - The destination CSV path.
   * @param {Array} arrays - The Array to write.
   * @param {object} [options] - See {@link https://docs.tuckn.net/WshUtil/Wsh.Util.html#.stringify2DArrayToCsv|Wsh.Util.stringify2DArrayToCsv options} and {@link Wsh.FileSystem.writeFileSync options}.
   * @param {string} [options.encoding='utf-8'] - latin1 (iso-8859-1), utf8, utf16, sjis (shift_jis, cp932), All Charset -> HKEY_CLASSES_ROOT\Mime\Database\Charset\
   * @param {boolean} [options.bom=true] - true => enable, others => disable
   * @returns {void}
   */
  fse.writeCsvSync = function (csvpath, arrays, options) {
    var FN = 'fse.writeCsvSync';
    if (!isSolidString(csvpath)) throwErrNonStr(FN, csvpath);
    if (!isSolidArray(arrays)) throwErrNonArray(FN, arrays);

    var stringified = util.stringify2DArrayToCsv(arrays, options);

    var encoding = obtain(options, 'encoding', CD.ado.charset.utf8);
    var bom = obtain(options, 'bom', true);
    fs.writeFileSync(csvpath, stringified, { encoding: encoding, bom: bom });
  }; // }}}

  // fse.readCsvSync  {{{
  /**
   * Gets a two dimensions array from the CSV file.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * var readArray = fse.readCsvSync('D:\\logs.csv', { encoding: 'sjis' });
   * // Returns: [
   * //   ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
   * //   ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
   * //   ['2020/1/1', '\'007', 'Has Space', '日本語', 'I say "Yes!"', 'Line\r\nBreak', 'Foo,Bar,Baz'],
   * //   ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']
   * // ]
   * @function readCsvSync
   * @memberof Wsh.FileSystemExtra
   * @param {string} csvpath - The CSV file path to read.
   * @param {object} [options] - See {@link Wsh.FileSystem.readFileSync options} and {@link https://docs.tuckn.net/WshUtil/Wsh.Util.html#.parseCsvTo2DArray|Wsh.Util.parseCsvTo2DArray options}
   * @param {string} [options.encoding='utf-8'] - latin1 (iso-8859-1), utf8, utf16, sjis (shift_jis, cp932), All Charset -> HKEY_CLASSES_ROOT\Mime\Database\Charset\
   * @returns {Array} - The read array.
   */
  fse.readCsvSync = function (csvpath, options) {
    var FN = 'fse.readCsvSync';
    if (!fs.existsSync(csvpath)) throwErrNonExist(FN, csvpath);

    var encoding = obtain(options, 'encoding', CD.ado.charset.utf8);
    var throws = obtain(options, 'throws', true);
    var csvText = fs.readFileSync(csvpath, {
      encoding: encoding,
      throws: throws
    });

    return util.parseCsvTo2DArray(csvText, options);
  }; // }}}

  // fse.readCsvFileAsAssocArray {{{
  /**
   * Gets an array of objects from the CSV file.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   * var csvFile = 'D:\\MyData.csv';
   * // The content of this csv is
   * // ```
   * // This CSV was output from Tuckn Hoge system
   * // A,B,C,D,E,F,G,H,I,J,K,L
   * // 0,1,2,3,4,5,6,7,8,9,10,11
   * // a,b,c,d,e,f,g,h,i,j,k,l
   * //
   * // true,false,null,undefined,NaN,Infinity
   * // =SUM(X1:Y10),=TODAY(),2020/1/1,'007,Has Space,日本語,I say "Yes!","Line
   * // Break"
   * // ```
   *
   * var readObj = readCsvFileAsAssocArray(csvFile, { beginRow: 2 });
   * // line 1 will be ignored, line 2 to be header (property) name.
   * // Returns: [
   * //   {
   * //     A: '0',
   * //     B: '1',
   * //     C: '2',
   * //     D: '3',
   * //     E: '4',
   * //     F: '5',
   * //     G: '6',
   * //     H: '7',
   * //     I: '8',
   * //     J: '9',
   * //     K: '10',
   * //     L: '11'
   * //   },
   * //   {
   * //     A: 'a',
   * //     B: 'b',
   * //     C: 'c',
   * //     D: 'd',
   * //     E: 'e',
   * //     F: 'f',
   * //     G: 'g',
   * //     H: 'h',
   * //     I: 'i',
   * //     J: 'j',
   * //     K: 'k',
   * //     L: 'l'
   * //   },
   * //   {
   * //     A: 'true',
   * //     B: 'false',
   * //     C: 'null',
   * //     D: 'undefined',
   * //     E: 'NaN',
   * //     F: 'Infinity',
   * //     G: undefined,
   * //     H: undefined,
   * //     I: undefined,
   * //     J: undefined,
   * //     K: undefined,
   * //     L: undefined
   * //   },
   * //   {
   * //     A: '=SUM(X1:Y10)',
   * //     B: '=TODAY()',
   * //     C: '2020/1/1',
   * //     D: '\'007',
   * //     E: 'Has Space',
   * //     F: '日本語',
   * //     G: 'I say "Yes!"',
   * //     H: '"Line\r\nBreak"',
   * //     I: undefined,
   * //     J: undefined,
   * //     K: undefined,
   * //     L: undefined
   * //   }
   * // ];
   * @function readCsvFileAsAssocArray
   * @memberof Wsh.FileSystemExtra
   * @param {string} csvpath - The CSV Filepath to read.
   * @param {object} [options] - See {@link Wsh.FileSystem.readCsvSync options} and {@link https://docs.tuckn.net/WshUtil/Wsh.Util.html#.conv2DArrayToObj|Wsh.Util.conv2DArrayToObj options}.
   * @returns {Array} - The array of objects.
   */
  fse.readCsvFileAsAssocArray = function (csvpath, options) {
    var FN = 'fse.readCsvFileAsAssocArray';
    if (!fs.existsSync(csvpath)) throwErrNonExist(FN, csvpath);

    var arrays = fse.readCsvSync(csvpath, options);

    return util.conv2DArrayToObj(arrays, options);
  }; // }}}

  // fse.findRequiredFile  {{{
  /**
   * [Experimental] Gets a full file path from the argument string.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * var setPath = fse.findRequiredFile('./settings.json');
   * // Searches for existing files with the following priority
   * // <Current Dir>\\settings.json
   * // <UserProfile Dir>\\settings.json
   * @function findRequiredFile
   * @memberof Wsh.FileSystemExtra
   * @param {string} pathStr
   * @param {object} [options] - Optional parameters.
   * @param {string} [options.ext=''] - Ex. ".js" (Don't foget ".")
   * @returns {string}
   */
  fse.findRequiredFile = function (pathStr, options) {
    var parsed = path.parse(path.normalize(pathStr));
    var baseDir = parsed.dir;
    var fineName = parsed.base + obtain(options, 'ext', '');
    var fileFound = '';

    // 0. Absolute path
    if (path.isAbsolute(baseDir)) {
      fileFound = path.join(baseDir, fineName);
      return fileFound;
    }

    // @TODO process.cwd()

    // 1. Find the current(__dirname)
    if (!isSolidString(baseDir)) {
      fileFound = path.join(__dirname, fineName);

      if (fs.existsSync(fileFound)) {
        return fileFound;
      }
    }

    var partFinding = path.join(baseDir, fineName);
    fileFound = path.normalize(path.join(__dirname, partFinding));

    if (fs.existsSync(fileFound)) {
      return fileFound;
    }

    // 2. Find parents
    var parentDir = path.dirname(__dirname);

    if (isSolidString(parentDir)) {
      fileFound = path.normalize(path.join(parentDir, partFinding));

      if (fs.existsSync(fileFound)) {
        return fileFound;
      } else {
        parentDir = path.dirname(parentDir);
      }
    }

    // 3. Find %USERPROFILE%
    parentDir = os.userInfo().homedir;
    fileFound = path.normalize(path.join(parentDir, partFinding));

    if (fs.existsSync(fileFound)) {
      return fileFound;
    }

    // 4. Find %PATH%
    // @TODO

    return '';
  }; // }}}

  // fse.copyWshFilesDefinedInWsf  {{{
  /**
   * [Experimental] Copies script files defined in the .wsf file.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * fse.copyWshFilesDefinedInWsf('D:\\src.wsf','D:\\destDir');
   * @function copyWshFilesDefinedInWsf
   * @memberof Wsh.FileSystemExtra
   * @param {string} srcWsf - The .wsf file.
   * @param {string} destDir - The destination directory path.
   * @returns {void}
   */
  fse.copyWshFilesDefinedInWsf = function (srcWsf, destDir) {
    var srcWsfLines = fs.readFileSync(srcWsf, { encoding: CD.ado.charset.utf8 }).split('\n');
    var foWsf = path.dirname(srcWsf);
    var srcFile = '';
    var srcFiles = [];
    var destFiles = [];

    // Gets defined files.
    srcWsfLines.forEach(function (val) {
      if (/script language="\w+Script" src="/i.test(val)) {
        srcFile = val.match(/src="(.+)"><\/script>/i)[1];
        srcFiles.push(path.resolve(path.join(foWsf, srcFile)));
        destFiles.push(path.resolve(path.join(destDir, srcFile)));
      }
    });

    // Copies the WSH script files to the dest directory.
    srcFiles.forEach(function (src, i) {
      if (fs.existsSync(src)) fs.copyFileSync(src, destFiles[i]);
    });
  }; // }}}

  // fse.dirTree  {{{
  /**
   * Can not work. Please use {@link Wsh.FileSystemExtra.readdirSyncRecursively}.
   *
   * @function dirTree
   * @memberof Wsh.FileSystemExtra
   * @param {string} dirPath - A directory path
   * @param {object} [options]
   * @param {boolean} [options.isDirOnly=false]
   * @param {string} [options.extensions] - Ex. {extensions:'\.txt|\.doc'} 正規表現。ファイルの場合のみ有効なオプション
   * @param {string} [options.exclude] - Ex. {exclude:'C:\\tkn\\tmp'} 正規表現。フルパスで判定される除外オプション
   * @returns {object}
   */
  fse.dirTree = function (dirPath, options) {
    var FN = 'fse.dirTree';
    if (!isString(dirPath)) throwErrNonStr(FN, dirPath);
    if (!fs.statSync(dirPath).isDirectory()) throwErrNonExist(FN, dirPath);

    var lines = fs.getAllChildrensFullPaths(dirPath, options);
    lines.pop(); // remove the last line as blank.
    lines.sort(function (a, b) {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    var dirobj = { children: [] };
    var dirPt = dirobj;
    dirobj.path = dirPath;
    dirobj.name = path.basename(dirPath);
    dirobj.type = 'directory';

    var exclude = obtain(options, 'exclude', '');
    var regexpExc = isSolidString(exclude) ? new RegExp(exclude) : null;
    var extensions = obtain(options, 'extensions', '');
    var regexpExt = isSolidString(extensions) ? new RegExp(extensions) : null;
    var names = [], joinedPath, isDefined = false, fileExt;

    for (var i = 0, I = lines.length; i < I; i++) {
      if (regexpExc && regexpExc.test(lines[i])) continue;

      // 指定されたフォルダパスを除去して、\\区切りで配列にする
      names = lines[i].slice(dirPath.length)
          .replace(/^\\+/, '').split(path.sep);
      // .replace(new RegExp('^' + dirPath.replace(/\\/g, '\\\\')), '').
      // console.log(names);
      dirPt = dirobj; // Set dir pointer to root.
      joinedPath = dirPath; // Set path string to root.

      for (var j = 0, J = names.length; j < J; j++) {
        joinedPath = path.join(joinedPath, names[j]);

        if (fs.statSync(joinedPath).isDirectory()) {
          if (dirPt.children.length === 0) {
            dirPt.children.push({
              path: joinedPath,
              name: names[j],
              type: 'directory',
              children: []
            });
            dirPt = dirPt.children[0];
          } else {
            isDefined = false;

            for (var k = 0, K = dirPt.children.length; k < K; k++) {
              // 既にdirの定義がある場合
              if (dirPt.children[k].name === names[j] && hasIn(dirPt.children[k], 'children')) {
                dirPt = dirPt.children[k]; // Move dir pointer.
                isDefined = true;
                break;
              }
            }

            if (!isDefined) {
              dirPt.children.push({
                path: joinedPath,
                name: names[j],
                type: 'directory',
                children: []
              });
              dirPt = dirPt.children[dirPt.children.length - 1];
            }
          }
        } else {
          fileExt = '.' + path.extname(joinedPath).toLowerCase();

          if (regexpExt || regexpExt.test(fileExt)) {
            dirPt.children.push({
              path: joinedPath,
              name: names[j],
              type: 'file',
              // attribute: fso.GetFile(joinedPath).Attributes,
              extension: fileExt
            });
          }
          break;
        }
      }
    }

    return dirobj;

  /* ↓treeでObject化しようとして途中で断念した奴 {{{
    var
      _ttl = 'getAllCategoriesInMyNote',
      cmd = 'tree "' + _path.dirNote + '" | find "─+"' ,
      rtnDic = child_process.execSync(cmd, { encoding:'sjis' });
      lines = [], i, I, len, prelen, p,
      ctgPt, nodeStr = '', pname = '', prepname = '', dirName = '',
      ctg = {
        path: _path.dirNote,
        name: 'note',
        node: '',
        children: []
      };

    lines = rtnDic.stdout.replace(/\r/g, '').split('\n');

    // tree出力例
    // C:\>tree "C:\tkn\home\note" | find "─+"
    // ├─+business
    // ├─+clothing
    // ├─+computer
    // │  ├─+operationsManagement
    // │  ├─+OS
    // │  │  ├─+Linux
    // │  │  └─+Windows
    ctgPt = ctg.children; // ctgオブジェクトのポインター

    for (i = 0, I = lines.length; i < I; i++) {
      prepname = pname;
      pname = 'category' + i;

      if ((/^[└├]─\+.+/).test(lines[i])) {
        ctgPt = ctg; // Set the dirPt at root.

        nodeStr = lines[i].replace(/^([└├]─)\+.+/, '$1');
        ctgPt.nodeStr = nodeStr;
        prelen = nodeStr.length;

        dirName = lines[i].replace(/^[└├]─\+(.+)/, '$1');
        ctgPt[pname] = { dirName: dirName, children: {} };
      }
      // "├─+"の前に何字あるかで階層を判断
      else {
        nodeStr = lines[i].replace(/^([ │]+[└├]─)\+.+/, '$1');
        dirName = lines[i].replace(/^[ │]+[└├]─\+(.+)/, '$1');

        // nodeStrの違いで階層位置を特定、ポインターの移動
        len = nodeStr.length;

        // 文字数が同じ->同じ階層
        if (prelen === len) {
          ctgPt[pname] = { dirName: dirName, children: {} };
        }
        // 多い場合は1つ深い階層。2つ飛びで深い階層になるものはない
        else if (prelen < len) {
          ctgPt = ctgPt[prepname].children; // slide the dirPt.
          ctgPt.nodeStr = nodeStr;
          prelen = nodeStr.length;
          ctgPt[pname] = { dirName: dirName, children: {} };
        }
        // 階層を遡る。一番難しい
        // ルートから全ての階層を読んでいき最後にnodeStrが一致したとこ
        else if (prelen > len) {
          for (p in ctg) {
            if (p == 'nodeStr') {
              //console.log(ctg[p]);
            } else {
              //fn(ctg);
            }
          }

          ctgPt[pname] = { dirName: dirName, children: {} };
        }

      }
    }
console.log(ctg);

    return ctg;
}}} */
  }; // }}}

  // fse.readdirSyncRecursively  {{{
  /**
   * Recursively lists all files in a directory and its subdirectories.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * var testDir = 'D:\\testDir';
   * //  D:\testDir\
   * //  │  fileRoot1.txt
   * //  │  fileRoot2-Symlink.log
   * //  │  fileRoot2.log
   * //  │
   * //  ├─DirBar\
   * //  │  │  fileBar1.txt
   * //  │  │
   * //  │  └─DirQuux\
   * //  │          fileQuux1-Symlink.log
   * //  │          fileQuux1.txt
   * //  │
   * //  ├─DirFoo\
   * //  └─DirFoo-Symlink\
   *
   * // Ex.1 No options
   * fse.readdirSyncRecursively();
   * // Returns: [
   * //   'fileRoot1.txt',
   * //   'fileRoot2-Symlink.log', // <SYMLINKD>
   * //   'fileRoot2.log',
   * //   'DirBar',
   * //   'DirFoo',
   * //   'DirFoo-Symlink', // <SYMLINKD>
   * //   'DirBar\\fileBar1.txt',
   * //   'DirBar\\DirQuux',
   * //   'DirBar\\DirQuux\\fileQuux1-Symlink.log', // <SYMLINKD>
   * //   'DirBar\\DirQuux\\fileQuux1.txt' ]
   *
   * // Ex.2 Files only
   * fse.readdirSyncRecursively(testDir, { isOnlyFile: true });
   * // Returns: [
   * //   'fileRoot1.txt',
   * //   'fileRoot2-Symlink.log', // <SYMLINKD>
   * //   'fileRoot2.log',
   * //   'DirBar\\fileBar1.txt',
   * //   'DirBar\\DirQuux\\fileQuux1-Symlink.log', // <SYMLINKD>
   * //   'DirBar\\DirQuux\\fileQuux1.txt' ]
   *
   * // Ex.3 Directories only
   * fse.readdirSyncRecursively(testDir, { isOnlyDir: true });
   * // Returns: [
   * //   'DirBar',
   * //   'DirFoo',
   * //   'DirFoo-Symlink', // <SYMLINKD>
   * //   'DirBar\\DirQuux' ]
   *
   * // Ex.4 Excludes Symlink
   * fse.readdirSyncRecursively(testDir, { excludesSymlink: true });
   * // Returns: [
   * //   'fileRoot1.txt',
   * //   'fileRoot2.log',
   * //   'DirBar',
   * //   'DirFoo',
   * //   'DirBar\\fileBar1.txt',
   * //   'DirBar\\DirQuux',
   * //   'DirBar\\DirQuux\\fileQuux1.txt' ]
   *
   * // Ex.5 Filtering
   * fse.readdirSyncRecursively(testDir, {
   *   matchedRegExp: '\\d+\\.txt$',
   *   ignoredRegExp: 'Root'
   * });
   * // Returns:
   * // ['DirBar\\fileBar1.txt',
   * //  'DirBar\\DirQuux\\fileQuux1.txt'];
   *
   * // Ex.6 withFileTypes
   * fse.readdirSyncRecursively(testDir, { withFileTypes: true });
   * // Returns: [
   * // { neme: 'fileRoot1.txt',
   * //   path: 'D:\\testDir\\fileRoot1.txt,
   * //   attributes: 32,
   * //   isDirectory: false,
   * //   isFile: true,
   * //   isSymbolicLink: false,
   * //   ...
   * // },
   * // { neme: 'fileRoot2.log',
   * //   path: 'D:\\testDir\\fileRoot2.log',
   * //   ...
   * // },
   * // ...
   * // }]
   * @function readdirSyncRecursively
   * @memberof Wsh.FileSystemExtra
   * @param {string} dirPath - The directory path to read.
   * @param {object} [options] - Optional parameters.
   * @param {boolean} [options.isOnlyDir=false]
   * @param {boolean} [options.isOnlyFile=false]
   * @param {boolean} [options.excludesSymlink=false]
   * @param {string} [options.matchedRegExp] - Ex. "\\d+\\.txt$"
   * @param {string} [options.ignoredRegExp] - Ex. "[_\\-.]cache\\d+"
   * @param {boolean} [options.withFileTypes=false] - false: ['relative path1', 'relative path1', ...]. true: [{ name: 'full path1', isDirectory: true} ...]
   * @param {boolean} [options.ignoresErr=false] - Even if an error occurs during processing, it will be ignored.
   * @param {string} [options.prefixDirName]
   * @returns {string[]|object[]} - The array of files info.
   */
  fse.readdirSyncRecursively = function (dirPath, options) {
    var FN = 'fse.readdirSyncRecursively';
    if (!isString(dirPath)) throwErrNonStr(FN, dirPath);
    if (!fs.statSync(dirPath).isDirectory()) throwErrNonExist(FN, dirPath);

    // Get the top files
    var rtnFiles = fs.readdirSync(dirPath, options);

    // Get the top directories names
    var subDirsNames = fs.readdirSync(dirPath, {
      prefixDirName: '',
      isOnlyDir: true,
      withFileTypes: false,
      ignoresErr: obtain(options, 'ignoresErr', false),
      excludesSymlink: obtain(options, 'excludesSymlink', false),
      matchedRegExp: '',
      ignoredRegExp: ''
    });

    // recursively
    var prefixDirName = obtain(options, 'prefixDirName', '');

    subDirsNames.forEach(function (dirName) {
      var subFiles = fse.readdirSyncRecursively(path.join(dirPath, dirName),
        objAdd({}, options,
          { prefixDirName: path.join(prefixDirName, dirName) }));

      rtnFiles = rtnFiles.concat(subFiles);
    });

    return rtnFiles;
  }; // }}}

  // fse.readdirSyncRecursivelyWithDIR  {{{
  /**
   * [W.I.P] Recursively lists all files in a directory and its subdirectories with dir command.
   *
   * @function readdirSyncRecursivelyWithDIR
   * @memberof Wsh.FileSystemExtra
   * @param {string} dirPath A directory path
   * @param {object} options
   * @param {boolean} [options.withFileTypes=false] - false: ['relative path1', 'relative path1', ...]. true: [{ name: 'full path1', isDirectory: true} ...]
   * @param {string} [options.matchedRegExp] Ex. "\\w+\\.txt$"
   * @param {string} [options.ignoredRegExp] Ex. "[_\\-.]cache\\d+"
   * @returns {Array}
   */
  fse.readdirSyncRecursivelyWithDIR = function (dirPath, options) {
    var FN = 'fse.readdirSyncRecursively';
    if (!isString(dirPath)) throwErrNonStr(FN, dirPath);
    if (!fs.statSync(dirPath).isDirectory()) throwErrNonExist(FN, dirPath);

    var command = 'dir ' + srrd(dirPath) + ' /B /N /S /O:N';
    // directory only
    // var command = 'dir ' + srrd(dirPath) + ' /A:D /B /N /S /O:N';
    var exeCmd = srrd(os.exefiles.cmd) + ' /S /C"' + command + '"';

    var retObj = os.execSync(exeCmd);
    if (retObj.exitCode !== CD.runs.ok) {
      throw new Error('Error: [ExitCode is not 0]\n'
          + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
          + '  command: ' + command + '\n'
          + '  exitCode: ' + retObj.exitCode + '\n'
          + '  stdout: ' + retObj.stdout + '\n'
          + '  stderr: ' + retObj.stderr);
    }

    var fullPaths = retObj.stdout.split('\r\n');

    fullPaths.pop(); // 最後は空白なので除く

    var withFileTypes = obtain(options, 'withFileTypes', false);
    var matchedRegExp = obtain(options, 'matchedRegExp', null);
    var ignoredRegExp = obtain(options, 'ignoredRegExp', null);
    var mtchRE = isSolidString(matchedRegExp) ? new RegExp(matchedRegExp, 'i') : null;
    var ignrRE = isSolidString(ignoredRegExp) ? new RegExp(ignoredRegExp, 'i') : null;
    var rtnNames = [];
    var rtnName, isDir;

    fullPaths.forEach(function (fullPath) {
      rtnName = fullPath.replace(dirPath, '').replace(/^\\/, '');

      if (mtchRE !== null && !mtchRE.test(rtnName)) return;
      if (ignrRE !== null && ignrRE.test(rtnName)) return;

      if (withFileTypes) {
        if (!fs.existsSync(fullPath)) return;
        isDir = fs.statSync(fullPath).isDirectory();

        rtnNames.push({
          name: rtnName,
          path: fullPath,
          isDirectory: isDir,
          isFile: !isDir
        });
        /* @TODO isSymbolicLink: false, */
      } else {
        rtnNames.push(rtnName);
      }
    });

    return rtnNames;

    // File names only
    // return filePaths.map(function (val) {
    //   return val.replace(/.+\\([^\\]+)$/, '$1');
    // });
  }; // }}}

  // fse.getTruePath  {{{
  /**
   * [W.I.P] Gets the true path of the symbolic link.
   *
   * @function getTruePath
   * @memberof Wsh.FileSystemExtra
   * @param {string} fp - Filepath
   * @returns {string}
   */
  fse.getTruePath = function (fp) {
    if (path.isAbsolute(fp)) {
      //
    }

    var ph;
    // var objFolder = shApp.NameSpace(foParent);
    //
    // if (objFolder !== null) {
    //   ph = objFolder.ParseName(fileName);
    //   console.log(ph);
    //   //ph = _ph.extendedProperty('linktarget');
    // }
    //
    return ph;
  }; // }}}

  // fse.calcCryptHash  {{{
  /**
   * Generates the cryptographic hash from the file. If the file size is 0, returns 0.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * fse.calcCryptHash('D:\File.txt'); // Default: SHA256
   * // Returns:
   * // 1053ed4aca3f61644f2aeb9be175480321530656653853f10b660652777955dd
   *
   * fse.calcCryptHash('D:\File.txt', 'SHA256');
   * // Returns:
   * // 1053ed4aca3f61644f2aeb9be175480321530656653853f10b660652777955dd
   *
   * fse.calcCryptHash('D:\File.txt', 'MD5');
   * // Returns:
   * // 51d52911dc0b646cfda6bb6a6ffa7525
   *
   * fse.calcCryptHash('D:\.gitkeep', 'MD5'); // The file size is zero
   * // Returns: 0
   * @function calcCryptHash
   * @memberof Wsh.FileSystemExtra
   * @param {string} filepath - The file path to check.
   * @param {string} [algorithm=SHA256] - MD2, MD4, MD5, SHA1, SHA256, SHA384, SHA512
   * @param {object} [options] - Optional parameters.
   * @param {object} [options.fsStatObj] - The object of fs.statSync returned.
   * @param {boolean} [options.isDryRun=false] - No execute, returns the string of command.
   * @returns {string} - The cryptographic hash or 0. if isDryRun is true, returns the command log string. Not execute.
   */
  fse.calcCryptHash = function (filepath, algorithm, options) {
    var FN = 'fse.calcCryptHash';
    if (!isString(filepath)) throwErrNonStr(FN, filepath);

    var fStat = obtain(options, 'fsStatObj', fs.statSync(filepath));
    if (!fStat.isFile()) throwErrNonExist(FN, filepath);
    if (fStat.size === 0) return 0;

    var algo = isSolidString(algorithm) ? algorithm.toUpperCase() : 'SHA256';
    var args = ['-hashfile', filepath, algo];
    var retVal;

    try {
      var isDryRun = obtain(options, 'isDryRun', false);

      /**
       * This process is slow due to using certutil.exe. {@link https://technet.microsoft.com/ja-jp/library/cc732443(v=ws.10).aspx|Certutil}
       *
       * @example
       * C:\>certutil -hashfile "R:\tmp\testimg.png" MD5
       * // Success
       * stdout: "MD5 ハッシュ (ファイル R:\tmp\testimg.png):
       *   023f34ab9d961d19d81799ab52ac354d
       *   CertUtil: -hashfile コマンドは正常に完了しました。"
       * stderr: ""
       *
       * // Error Pattern 1. ERROR_SHARING_VIOLATION
       * stdout: "CertUtil: -hashfile コマンド エラーです: 0x80070020 (WIN32: 32 ERROR_SHARING_VIOLATION)
       *   CertUtil: プロセスはファイルにアクセスできません。別のプロセスが使用中です。"
       * stderr: ""
       *
       *  // Error Pattern 2. ERROR_FILE_INVALID (file size 0)
       * stdout: "CertUtil: -hashfile コマンド エラーです: 0x800703ee (WIN32: 1006 ERROR_FILE_INVALID)
       *   CertUtil: ファイルを格納しているボリュームが外部的に変更されたため、開かれているファイルが無効になりました。"
       * stderr: ""
       */

      retVal = os.execSync(CERTUTIL, args, {
        shell: false,
        isDryRun: isDryRun
      });

      if (isDryRun) return 'dry-run [' + FN + ']: ' + retVal;

      if (retVal.exitCode !== CD.runs.ok) {
        throw new Error('Error: [ExitCode is ' + retVal.exitCode + ']\n');
      }
    } catch (e) {
      // Copy the file to %TMP% and retry
      var tmpFile = os.makeTmpPath('fse-calcCryptHash_');
      fse.copySync(filepath, tmpFile);
      args = ['-hashfile', tmpFile, algo];

      retVal = os.execSync(CERTUTIL, args, { shell: false });
      fse.removeSync(tmpFile); // Clean

      if (retVal.exitCode !== CD.runs.ok) {
        throw new Error(insp(e) + '\n'
            + '  at ' + FN + ' (' + MODULE_TITLE + ')\n'
            + '  exitCode: ' + retVal.exitCode + '\n'
            + '  stdout: ' + retVal.stdout + '\n'
            + '  stderr: ' + retVal.stderr);
      }
    }

    return retVal.stdout.replace(/\r/g, '').split('\n')[1];
  }; // }}}

  // fse.compareFilesOfModifiedDate  {{{
  /**
   * Compares two files by modification date.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * fse.compareFilesOfModifiedDate('C:\FileA.txt', 'D:\FileB.txt');
   * // Returns: true or false
   * @function compareFilesOfModifiedDate
   * @memberof Wsh.FileSystemExtra
   * @param {string} fpA - The file path to compare.
   * @param {string} fpB - Another file path.
   * @param {object} [options] - Optional parameters.
   * @param {object} [options.fsAStatObj] - The fs.stat object of fpA.
   * @param {object} [options.fsBStatObj] - The fs.stat object of fpB.
   * @returns {boolean} - If the same date, return true.
   */
  fse.compareFilesOfModifiedDate = function (fpA, fpB, options) {
    var FN = 'fse.compareFilesOfModifiedDate';

    var fAStat = obtain(options, 'fsAStatObj', fs.statSync(fpA));
    if (!fs.statSync(fpA).isFile()) throwErrNonExist(FN, fpA);

    var fBStat = obtain(options, 'fsBStatObj', fs.statSync(fpB));
    if (!fs.statSync(fpB).isFile()) throwErrNonExist(FN, fpB);

    var diffMilliSec = Math.abs(Number(fAStat.mtime) - Number(fBStat.mtime));

    // Covers the differences between file systems. e.g. FAT32 and NTFS
    return diffMilliSec < 3000; // Ignore difference to 3 sec
  }; // }}}

  // fse.isTheSameFile  {{{
  /**
   * Compares two files by modification date or hash value.
   *
   * @example
   * var fse = Wsh.FileSystemExtra; // Shorthand
   *
   * // Default: cpmpare by modification date
   * fse.isTheSameFile('C:\FileA.txt', 'D:\FileB.txt');
   * // Returns: true or false
   *
   * fse.isTheSameFile('C:\FileA.txt', 'D:\FileB.txt', 'MD5');
   * // Returns: true or false
   * @function isTheSameFile
   * @memberof Wsh.FileSystemExtra
   * @param {string} fpA - A file path
   * @param {string} fpB - Another file path
   * @param {string} [algorithm='date'] - 'date'(Modification), 'MD2', 'MD4', 'MD5', 'SHA1', 'SHA256', 'SHA384', 'SHA512'
   * @returns {boolean}
   */
  fse.isTheSameFile = function (fpA, fpB, algorithm) {
    var FN = 'fse.isTheSameFile';

    var fAStat = fs.statSync(fpA);
    if (!fAStat.isFile()) throwErrNonExist(FN, fpA);

    var fBStat = fs.statSync(fpB);
    if (!fBStat.isFile()) throwErrNonExist(FN, fpB);

    if (!isSolidString(algorithm) || algorithm.toUpperCase() === 'DATE') {
      return fse.compareFilesOfModifiedDate(fpA, fpB, {
        fsAStatObj: fAStat,
        fsBStatObj: fBStat
      });
    } else {
      return (fse.calcCryptHash(fpA, algorithm, { fsStatObj: fAStat })
          === fse.calcCryptHash(fpB, algorithm, { fsStatObj: fBStat }));
    }
  }; // }}}
})();

// vim:set foldmethod=marker commentstring=//%s :
