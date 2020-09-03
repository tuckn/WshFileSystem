/* globals Wsh: false */
/* globals __dirname: false */
/* globals __filename: false */
/* globals FILE_ATTRIBUTE_DIRECTORY: false */
/* globals FILE_ATTRIBUTE_SYMLINKD_FILE: false */
/* globals FILE_ATTRIBUTE_SYMLINKD_DIR: false */

/* globals describe: false */
/* globals test: false */
/* globals expect: false */

// Shorthand
var CD = Wsh.Constants;
var util = Wsh.Util;
var fso = Wsh.FileSystemObject;
var path = Wsh.Path;
var os = Wsh.OS;
var fs = Wsh.FileSystem;

var isString = util.isString;
var CMD = os.exefiles.cmd;
var XCOPY = os.exefiles.xcopy;

var _cb = function (fn/* , args */) {
  var args = Array.from(arguments).slice(1);
  return function () { fn.apply(null, args); };
};

describe('FileSystem', function () {
  var uncPath = path.toUNC(__dirname);
  var tmpPathA = os.makeTmpPath('fs-test-A_');
  var tmpPathB = os.makeTmpPath('fs-test-B_');
  var assetsDir = path.join(__dirname, 'assets');
  var srcTxtSjis = path.join(assetsDir, 'src-sjis.txt');
  var srcTxtUtf16BeBom = path.join(assetsDir, 'src-utf16be-bom.txt');
  var srcTxtUtf16Le = path.join(assetsDir, 'src-utf16le.txt');
  var srcTxtUtf16LeBom = path.join(assetsDir, 'src-utf16le.txt');
  var srcTxtUtf8 = path.join(assetsDir, 'src-utf8.txt');
  var srcTxtUtf8Bom = path.join(assetsDir, 'src-utf8-bom.txt');
  var fileZeroSize = path.join(assetsDir, 'ZeroSizeFile');
  var charsetStrs = [
    '0123456789',
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '!"#$%&\'()*+,-./:,<=>?@[\\]^_`{|}~',
    '０１２３４５６７８９',
    'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ',
    'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ',
    '！”＃＄％＆’（）＊＋，－．／：；＜＝＞？＠［￥］＾＿‘｛｜｝￣',
    'あかさたなはまやらわんぁぃぅぇぉ',
    '臨兵闘者皆陣烈在前',
    'ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ'
  ];
  var textBodyCRLF = charsetStrs.join('\r\n');
  var noneStrVals = [true, false, undefined, null, 0, 1, NaN, Infinity, [], {}];

  test('constants', function () {
    // https://nodejs.org/api/fs.html#fs_fs_constants
    // File Access Constants
    expect(fs.constants.F_OK).toBe(0);
    expect(fs.constants.R_OK).toBe(4);
    expect(fs.constants.W_OK).toBe(2);
    expect(fs.constants.X_OK).toBe(1);
    // File Copy Constants
    expect(fs.constants.COPYFILE_EXCL).toBe(1);
    // File Open Constants
    expect(fs.constants.O_RDONLY).toBe(0);
    expect(fs.constants.O_WRONLY).toBe(1);
    expect(fs.constants.O_RDWR).toBe(2);
    expect(fs.constants.O_CREAT).toBe(256);
    expect(fs.constants.O_EXCL).toBe(1024);
    expect(fs.constants.O_TRUNC).toBe(512);
    expect(fs.constants.O_APPEND).toBe(8);
    // File Type Constants
    expect(fs.constants.S_IFMT).toBe(61440);
    expect(fs.constants.S_IFREG).toBe(32768);
    expect(fs.constants.S_IFDIR).toBe(16384);
    expect(fs.constants.S_IFCHR).toBe(8192);
    expect(fs.constants.S_IFLNK).toBe(40960);
    // ?
    expect(fs.constants.UV_FS_COPYFILE_EXCL).toBe(1);
  });

  test('inspectPathWhetherMAX_PATH', function () {
    var okPath = 'C:\\Users\\Tuckn\\AppData\\Roaming\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\ImplicitAppShortcuts\\database\\Document and Settings\\MongoDB Inc\\MongoDB Compass Community\\computer\\operationsManagement\\img\\screen-capture20191201T122357+0900.png';
    expect(okPath.length).toBeLessThanOrEqual(255);
    expect(fs.inspectPathWhetherMAX_PATH(okPath)).toBe(undefined);

    var longPath = 'C:\\Users\\Tuckn\\AppData\\Roaming\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\ImplicitAppShortcuts\\database\\Document and Settings\\MongoDB Inc\\MongoDB Compass Community\\computer\\operationsManagement\\img\\01_original_screencapture-20180213T043515+0900.png';
    expect(longPath.length).toBeGreaterThan(255);
    expect(_cb(fs.inspectPathWhetherMAX_PATH, longPath)).toThrowError();
  });

  // Create

  test('mkdirSync', function () {
    var tmpDirPath = os.makeTmpPath('test-mkdirsync_dir_');

    // Creates the directory
    expect(fs.existsSync(tmpDirPath)).toBe(false);
    expect(fs.mkdirSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(true);

    // Checks a throwing Error
    expect(_cb(fs.mkdirSync, tmpDirPath)).toThrowError();

    var nonExisting = path.join(tmpDirPath, 'NonExistingDir', 'newDir');
    expect(_cb(fs.mkdirSync, nonExisting)).toThrowError();

    // Cleans
    fso.DeleteFolder(tmpDirPath, CD.fso.force.yes);
    expect(fs.existsSync(tmpDirPath)).toBe(false);

    noneStrVals.forEach(function (val) {
      expect(_cb(fs.mkdirSync, val)).toThrowError();
    });
  });

  test('writeFileSync', function () {
    expect(_cb(fs.writeFileSync, 'C:\\NONE_EXISTING_DIR\\foo.txt', 'bar')).toThrowError();

    var tmpTxtPath = os.makeTmpPath('fs-writefile_', '.txt');
    // var readTxt;

    // @TODO Fix error [-2146825287]
    expect('@todo').toBe('passed');
    fs.writeFileSync(tmpTxtPath, '', { encoding: 'utf8' });
  });

  test('writeTmpFileSync', function () {
    var tmpTxtPath = fs.writeTmpFileSync(textBodyCRLF, { encoding: 'utf8' });

    expect(isString(tmpTxtPath)).toBe(true);

    var readTxt = fs.readFileSync(tmpTxtPath, { encoding: 'utf8' });
    expect(readTxt).toBe(textBodyCRLF);

    // Cleans
    expect(fs.unlinkSync(tmpTxtPath)).toBe(undefined);

    noneStrVals.forEach(function (val) {
      expect(_cb(fs.writeTmpFileSync, val)).toThrowError();
    });
  });

  // Read

  test('existsSync', function () {
    expect(fs.existsSync(__dirname)).toBe(true);
    expect(fs.existsSync(__filename)).toBe(true);
    expect(fs.existsSync(uncPath)).toBe(true);
    expect(fs.existsSync(tmpPathA)).toBe(false);
    // @note Testing symlink file/directory will be tested at "linkSync()"

    noneStrVals.forEach(function (val) {
      expect(fs.existsSync(val)).toBe(false);
    });
  });

  test('statSync', function () {
    noneStrVals.forEach(function (val) {
      expect(fs.existsSync(val)).toBe(false);
    });

    var stat;

    // A file
    stat = fs.statSync(__filename);
    expect(stat.size).toBeGreaterThan(0);
    expect(stat.isFile()).toBe(true);
    expect(stat.isDirectory()).toBe(false);
    expect(stat.isSymbolicLink()).toBe(false);
    // @TODO test the xtimes

    // A directory
    stat = fs.statSync(__dirname);
    expect(stat.size).toBe(0);
    expect(stat.isFile()).toBe(false);
    expect(stat.isDirectory()).toBe(true);
    expect(stat.isSymbolicLink()).toBe(false);
    // @TODO test the xtimes

    // The zero size file
    stat = fs.statSync(fileZeroSize);
    expect(stat.size).toBe(0);
    expect(stat.isFile()).toBe(true);
    expect(stat.isDirectory()).toBe(false);
    expect(stat.isSymbolicLink()).toBe(false);
    // @TODO test the xtimes

    // @TODO Testing symlink file/directory will be tested at "linkSync()"
    // var s = fs.statSync('D:\\Symlink Dir');
    // console.log(s.isFile());
    // console.log(s.isDirectory());
    // console.log(s.isSymbolicLink());
  });

  test('readFileSync', function () {
    var readDef = fs.readFileSync(srcTxtSjis);
    expect(typeof readDef).toBe('unknown');

    var readBin = fs.readFileSync(srcTxtSjis, { encoding: 'binary' });
    expect(typeof readBin).toBe('unknown');

    var readSjis = fs.readFileSync(srcTxtSjis, { encoding: 'sjis' });
    expect(typeof readSjis).toBe('string');
    expect(readSjis).toBe(textBodyCRLF);

    // Reads sjis as utf16
    var readUtf16le = fs.readFileSync(srcTxtSjis, { encoding: 'utf16' });
    expect(typeof readUtf16le).toBe('string');
    expect(readUtf16le).not.toBe(textBodyCRLF);

    // Reads utf16xx as utf16
    readUtf16le = fs.readFileSync(srcTxtUtf16BeBom, { encoding: 'utf16' });
    expect(typeof readUtf16le).toBe('string');
    expect(readUtf16le).toBe(textBodyCRLF);

    readUtf16le = fs.readFileSync(srcTxtUtf16Le, { encoding: 'utf16' });
    expect(typeof readUtf16le).toBe('string');
    expect(readUtf16le).toBe(textBodyCRLF);

    readUtf16le = fs.readFileSync(srcTxtUtf16LeBom, { encoding: 'utf16' });
    expect(typeof readUtf16le).toBe('string');
    expect(readUtf16le).toBe(textBodyCRLF);

    // Reads utf8xx as utf8
    var readUtf8 = fs.readFileSync(srcTxtUtf8, { encoding: 'utf8' });
    expect(typeof readUtf8).toBe('string');
    expect(readUtf8).toBe(textBodyCRLF);

    readUtf8 = fs.readFileSync(srcTxtUtf8Bom, { encoding: 'utf8' });
    expect(typeof readUtf8).toBe('string');
    expect(readUtf8).toBe(textBodyCRLF);

    var readLatin = fs.readFileSync(srcTxtSjis, { encoding: 'latin1' });
    expect(typeof readLatin).toBe('string');
    // console.dir(readLatin);

    expect('@TODO').toBe('tested');
  });

  test('readdirSync', function () {
    /*
     * @note A structure to test
     *   %TEMP%fs-readdir_xxxxx\
     *   │  fileRoot1.txt
     *   │  fileRoot2-Symlink.log // <SYMLINKD>
     *   │  fileRoot2.log
     *   │
     *   ├─DirBar\
     *   ├─DirBar-Symlink\ // <SYMLINKD>
     *   └─DirFoo\
     *           fileFoo1.txt
     */
    // Root
    var preName = 'fs-readdir_';
    var testDir = os.makeTmpPath(preName);
    var fileRoot1 = path.join(testDir, 'fileRoot1.txt');
    var fileRoot2 = path.join(testDir, 'fileRoot2.log');
    var fileRoot2Sym = path.join(testDir, 'fileRoot2-Symlink.log');
    // Creates
    fs.mkdirSync(testDir);
    fs.writeFileSync(fileRoot1, 'fileRoot1');
    fs.writeFileSync(fileRoot2, 'fileRoot2');
    fs.linkSync(fileRoot2, fileRoot2Sym);

    // DirFoo
    var dirFoo = path.join(testDir, 'DirFoo');
    var fileFoo1 = path.join(dirFoo, 'fileFoo1.txt');
    // Creates
    fs.mkdirSync(dirFoo);
    fs.writeFileSync(fileFoo1, 'fileFoo1');

    // DirBar
    var dirBar = path.join(testDir, 'DirBar');
    var dirBarSym = path.join(testDir, 'DirBar-Symlink');
    // Creates
    fs.mkdirSync(dirBar);
    fs.linkSync(dirBar, dirBarSym);

    var dirInfo;

    // Non options
    dirInfo = fs.readdirSync(testDir);
    expect(dirInfo).toEqual([
      'fileRoot1.txt',
      'fileRoot2-Symlink.log', // <SYMLINKD>
      'fileRoot2.log',
      'DirBar',
      'DirBar-Symlink', // <SYMLINKD>
      'DirFoo'
    ]);

    // Only files
    dirInfo = fs.readdirSync(testDir, { isOnlyFile: true });
    expect(dirInfo).toEqual([
      'fileRoot1.txt',
      'fileRoot2-Symlink.log', // <SYMLINKD>
      'fileRoot2.log'
    ]);

    // Only directoris
    dirInfo = fs.readdirSync(testDir, { isOnlyDir: true });
    expect(dirInfo).toEqual([
      'DirBar',
      'DirBar-Symlink', // <SYMLINKD>
      'DirFoo'
    ]);

    // Excludes symlinks
    dirInfo = fs.readdirSync(testDir, { excludesSymlink: false });
    expect(dirInfo).toEqual([
      'fileRoot1.txt',
      'fileRoot2-Symlink.log', // <SYMLINKD>
      'fileRoot2.log',
      'DirBar',
      'DirBar-Symlink', // <SYMLINKD>
      'DirFoo'
    ]);

    // Include symlinks
    dirInfo = fs.readdirSync(testDir, { excludesSymlink: true });
    expect(dirInfo).toEqual([
      'fileRoot1.txt',
      'fileRoot2.log',
      'DirBar',
      'DirFoo'
    ]);

    // Matcher Options
    dirInfo = fs.readdirSync(testDir, { matchedRegExp: '\\d+\\.txt$' });
    expect(dirInfo).toEqual(['fileRoot1.txt']);

    dirInfo = fs.readdirSync(testDir, { ignoredRegExp: '\\d+\\.txt$' });
    expect(dirInfo).toEqual([
      'fileRoot2-Symlink.log', // <SYMLINKD>
      'fileRoot2.log',
      'DirBar',
      'DirBar-Symlink', // <SYMLINKD>
      'DirFoo'
    ]);

    // Not include the parent directory names as the string of matching
    dirInfo = fs.readdirSync(testDir, { ignoredRegExp: preName });
    expect(dirInfo.length > 0).toBeTruthy();

    // Get file info
    dirInfo = fs.readdirSync(testDir, { withFileTypes: true });

    expect(dirInfo).toHaveLength(6);

    expect(dirInfo[0].name).toBe('fileRoot1.txt');
    expect(dirInfo[0].path).toBe(fileRoot1);
    expect(dirInfo[0].attributes).toBe(32);
    expect(dirInfo[0].isDirectory).toBe(false);
    expect(dirInfo[0].isFile).toBe(true);
    expect(dirInfo[0].isSymbolicLink).toBe(false);

    expect(dirInfo[1].name).toBe('fileRoot2-Symlink.log');
    expect(dirInfo[1].path).toBe(fileRoot2Sym);
    expect(dirInfo[1].attributes).toBe(FILE_ATTRIBUTE_SYMLINKD_FILE);
    expect(dirInfo[1].isDirectory).toBe(false);
    expect(dirInfo[1].isFile).toBe(true);
    expect(dirInfo[1].isSymbolicLink).toBe(true); // true

    expect(dirInfo[2].name).toBe('fileRoot2.log');
    expect(dirInfo[2].path).toBe(fileRoot2);
    expect(dirInfo[2].attributes).toBe(32);
    expect(dirInfo[2].isDirectory).toBe(false);
    expect(dirInfo[2].isFile).toBe(true);
    expect(dirInfo[2].isSymbolicLink).toBe(false);

    expect(dirInfo[3].name).toBe('DirBar');
    expect(dirInfo[3].path).toBe(dirBar);
    expect(dirInfo[3].attributes).toBe(FILE_ATTRIBUTE_DIRECTORY);
    expect(dirInfo[3].isDirectory).toBe(true);
    expect(dirInfo[3].isFile).toBe(false);
    expect(dirInfo[3].isSymbolicLink).toBe(false);

    expect(dirInfo[4].name).toBe('DirBar-Symlink');
    expect(dirInfo[4].path).toBe(dirBarSym);
    expect(dirInfo[4].attributes).toBe(FILE_ATTRIBUTE_SYMLINKD_DIR);
    expect(dirInfo[4].isDirectory).toBe(true);
    expect(dirInfo[4].isFile).toBe(false);
    expect(dirInfo[4].isSymbolicLink).toBe(true); // true

    expect(dirInfo[5].name).toBe('DirFoo');
    expect(dirInfo[5].path).toBe(dirFoo);
    expect(dirInfo[5].attributes).toBe(FILE_ATTRIBUTE_DIRECTORY);
    expect(dirInfo[5].isDirectory).toBe(true);
    expect(dirInfo[5].isFile).toBe(false);
    expect(dirInfo[5].isSymbolicLink).toBe(false);

    // Cleans
    fs.rmdirSync(testDir);

    noneStrVals.forEach(function (val) {
      expect(_cb(fs.readdirSync, val)).toThrowError();
    });
  });

  test('excludeSymboliclinkPaths', function () {
    expect('@TODO').toBe('tested');
  });

  test('getAllChildrensFullPaths', function () {
    expect('@TODO').toBe('tested');
  });

  // Update

  test('copyFileSync', function () {
    var tmpDirPath = os.makeTmpPath('test-copyfilesync_dir_');
    fs.mkdirSync(tmpDirPath);

    // Copies the file
    var tmpFilePath = path.join(tmpDirPath, 'tmp-file.wsf');
    expect(fs.existsSync(tmpFilePath)).toBe(false);
    expect(fs.copyFileSync(__filename, tmpFilePath)).toBe(undefined);
    expect(fs.existsSync(tmpFilePath)).toBe(true);

    // Check a throwing Error
    noneStrVals.forEach(function (val) {
      expect(_cb(fs.copyFileSync, val, val)).toThrowError();
    });

    // Directory
    var tmpCopiedDir = os.makeTmpPath('test-copyfilesync_copied-dir_');
    expect(_cb(fs.copyFileSync, tmpDirPath, tmpCopiedDir)).toThrowError();

    // Non-existing parent directory
    var nonExisting = path.join(tmpDirPath, 'NonExistingDir', 'newFile.tmp');
    expect(_cb(fs.copyFileSync, __filename, nonExisting)).toThrowError();

    // Cleans
    expect(fs.rmdirSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(false);
  });

  test('linkSync, (Run as admin)', function () {
    var retVal;

    // Confirm tmpA is not existing
    expect(fs.existsSync(tmpPathA)).toBe(false);
    expect(_cb(fs.statSync, tmpPathA)).toThrowError();
    // Make tmpA directory
    expect(fs.mkdirSync(tmpPathA)).toBe(undefined);
    // Confirm tmpA is existing
    expect(fs.existsSync(tmpPathA)).toBe(true);
    // Ckeck tmpA status
    var statA = fs.statSync(tmpPathA);
    expect(statA.isFile()).toBe(false);
    expect(statA.isDirectory()).toBe(true); // Directory
    expect(statA.isSymbolicLink()).toBe(false);

    // dry-run
    retVal = fs.linkSync(tmpPathA, tmpPathB, { isDryRun: true });
    expect(retVal).toContain(
      CMD + ' /S /C"mklink /D ' + tmpPathB + ' ' + tmpPathA + '"'
    );
    expect(fs.existsSync(tmpPathB)).toBe(false);

    // Confirm tmpB is not existing
    expect(fs.existsSync(tmpPathB)).toBe(false);
    // Create tmpA symlink as tmpB
    expect(fs.linkSync(tmpPathA, tmpPathB)).toBe(true);
    // Confirm tmpB is existing
    expect(fs.existsSync(tmpPathB)).toBe(true);
    // Ckeck tmpB status
    var statB = fs.statSync(tmpPathB); // Get status
    expect(statB.isFile()).toBe(false);
    expect(statB.isDirectory()).toBe(true); // Directory and
    expect(statB.isSymbolicLink()).toBe(true); // Symlink

    var copiedPathA = path.join(tmpPathA, path.basename(__filename));
    // Confirm tmpA\file is not existing
    expect(fs.existsSync(copiedPathA)).toBe(false);
    // Create the file into tmpA as a symlink
    expect(fs.linkSync(__filename, copiedPathA)).toBe(true);
    // Confirm tmpA\file is existing
    expect(fs.existsSync(copiedPathA)).toBe(true);

    var copiedPathB = path.join(tmpPathB, path.basename(__filename));
    // Confirm tmpB\file is existing, too
    expect(fs.existsSync(copiedPathB)).toBe(true);
    // Ckeck tmpB\file status
    var statFileB = fs.statSync(copiedPathB);
    expect(statFileB.isFile()).toBe(true); // File
    expect(statFileB.isDirectory()).toBe(false);
    expect(statFileB.isSymbolicLink()).toBe(true); // Symlink

    // Remove the simlink file in tmpB\file
    expect(fs.unlinkSync(copiedPathB)).toBe(undefined);
    // Confirm tmpA\file and tmpB\file are not existing
    expect(fs.existsSync(copiedPathB)).toBe(false);
    expect(fs.existsSync(copiedPathA)).toBe(false);

    // Remove tmpB directory
    expect(fs.rmdirSync(tmpPathB)).toBe(undefined);
    // Confirm tmpB is not existing
    expect(fs.existsSync(tmpPathB)).toBe(false);
    // Confirm tmpA is existing
    expect(fs.existsSync(tmpPathA)).toBe(true);

    // Remove tmpA directory
    expect(fs.rmdirSync(tmpPathA)).toBe(undefined);
    expect(fs.existsSync(tmpPathA)).toBe(false);
  });

  test('xcopySync', function () {
    var retVal;

    var tmpDirPath = os.makeTmpPath('test-xcopySync_dir_');
    fs.mkdirSync(tmpDirPath);

    // Copies the file
    var tmpFilePath = path.join(tmpDirPath, 'tmp-file.wsf');
    expect(fs.existsSync(tmpFilePath)).toBe(false);

    // dry-run
    retVal = fs.xcopySync(__filename, tmpFilePath, { isDryRun: true });
    expect(retVal).toContain(CMD + ' /S /C"ECHO  F|'
      + XCOPY + ' ' + __filename + ' ' + tmpFilePath + ' /H /R /Y"');
    expect(fs.existsSync(tmpFilePath)).toBe(false);

    expect(fs.xcopySync(__filename, tmpFilePath)).toBe(undefined);
    expect(fs.existsSync(tmpFilePath)).toBe(true);
    // Non Error
    expect(fs.xcopySync(__filename, tmpFilePath)).toBe(undefined);

    // With `withStd` option

    // dry-run
    var tmpFilePath2 = tmpDirPath + '2';
    retVal = fs.xcopySync(__filename, tmpFilePath2, {
      withStd: true,
      isDryRun: true
    });
    expect(retVal).toContain(CMD + ' /S /C"ECHO  F|'
      + XCOPY + ' ' + __filename + ' ' + tmpFilePath2 + ' /H /R /Y"');
    expect(fs.existsSync(tmpFilePath2)).toBe(false);

    retVal = fs.xcopySync(__filename, tmpFilePath2, { withStd: true });
    expect(retVal.error).toBeDefined(false);
    expect(retVal.exitCode).toBe(0);
    expect(retVal.stdout).toBeDefined();
    expect(retVal.stderr).toBeDefined();

    // Copies the directory
    var tmpCopiedDir = os.makeTmpPath('test-xcopySync_copied-dir_');
    expect(fs.existsSync(tmpCopiedDir)).toBe(false);

    // dry-run
    retVal = fs.xcopySync(tmpDirPath, tmpCopiedDir, { isDryRun: true });
    expect(retVal).toContain(CMD + ' /S /C"ECHO  D|'
      + XCOPY + ' ' + tmpDirPath + ' ' + tmpCopiedDir + ' /E /I /H /R /Y"');
    expect(fs.existsSync(tmpCopiedDir)).toBe(false);

    expect(fs.xcopySync(tmpDirPath, tmpCopiedDir)).toBe(undefined);
    expect(fs.existsSync(tmpCopiedDir)).toBe(true);
    // Non Error
    expect(fs.xcopySync(tmpDirPath, tmpCopiedDir)).toBe(undefined);

    // Check a throwing Error
    noneStrVals.forEach(function (val) {
      expect(_cb(fs.xcopySync, val, val)).toThrowError();
    });

    // Cleans
    expect(fs.rmdirSync(tmpCopiedDir)).toBe(undefined);
    expect(fs.existsSync(tmpCopiedDir)).toBe(false);

    expect(fs.rmdirSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(false);
  });

  // Delete

  test('rmdirSync', function () {
    var errVals = [true, false, undefined, null, 0, 1, NaN, Infinity, [], {}];
    errVals.forEach(function (val) {
      expect(_cb(fs.rmdirSync, val)).toThrowError();
    });

    var tmpDirPath = os.makeTmpPath('test-rmdirSync_dir_');
    var retVal;

    // [1]. dry-run
    fs.mkdirSync(tmpDirPath);

    // dry-run -> but  run
    retVal = fs.rmdirSync(tmpDirPath, { isDryRun: true });
    expect(retVal).toBeUndefined();
    expect(fs.existsSync(tmpDirPath)).toBe(false);

    // [2]. Removes the directory
    fs.mkdirSync(tmpDirPath);

    expect(fs.rmdirSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(false);

    // Checks a throwing error when non existing
    expect(_cb(fs.rmdirSync, tmpDirPath)).toThrowError();

    // [3]. Removes the directory including files
    fs.mkdirSync(tmpDirPath);

    var parentDir = path.join(tmpDirPath, 'parentDir');
    fs.mkdirSync(parentDir);

    var childDir = path.join(parentDir, 'childDir');
    fs.mkdirSync(childDir);

    var tmpFile = path.join(childDir, 'file.tmp');
    fso.CopyFile(__filename, tmpFile, CD.fso.overwrites.yes);

    // Deletes the file
    expect(_cb(fs.rmdirSync, tmpFile)).toThrowError();

    expect(fs.rmdirSync(parentDir)).toBe(undefined);

    // [4]. Symlink directory
    var dirSymSrc = path.join(tmpDirPath, 'dirSymSrc');
    fs.mkdirSync(dirSymSrc);

    var dirSymDest = path.join(tmpDirPath, 'dirSymDest');
    fs.linkSync(dirSymSrc, dirSymDest);

    expect(fs.rmdirSync(dirSymDest)).toBe(undefined);
    expect(fs.rmdirSync(dirSymSrc)).toBe(undefined);

    // [5]. Including symlink file
    var dirHasSymlink = path.join(tmpDirPath, 'dirHasSymlink');
    fs.mkdirSync(dirHasSymlink);

    var fileSymSrc = path.join(dirHasSymlink, 'fileSymSrc.tmp');
    fso.CopyFile(__filename, fileSymSrc, CD.fso.overwrites.yes);

    var fileSymDest = path.join(dirHasSymlink, 'symlink.file');
    fs.linkSync(fileSymSrc, fileSymDest);

    // // dry-run
    // retVal = fs.rmdirSync(dirHasSymlink, { isDryRun: true });
    // console.log(retVal);
    // // expect(retVal).toContain(
    // //   CMD + ' /S /C"mklink /D ' + tmpPathB + ' ' + tmpPathA + '"'
    // // );
    // expect(fs.existsSync(dirHasSymlink)).toBe(true);

    expect(fs.rmdirSync(dirHasSymlink)).toBe(undefined);
    expect(fs.existsSync(dirHasSymlink)).toBe(false);

    // Cleans
    expect(fs.rmdirSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(false);
  });

  test('unlinkSync', function () {
    var tmpDirPath = os.makeTmpPath('test-unlinkSync_dir_');
    fs.mkdirSync(tmpDirPath);

    var tmpFilePath = path.join(tmpDirPath, 'tmp-file.wsf');
    fs.copyFileSync(__filename, tmpFilePath);

    expect(fs.unlinkSync(tmpFilePath)).toBe(undefined);

    // Check a throwing Error
    expect(_cb(fs.unlinkSync, tmpFilePath)).toThrowError();
    expect(_cb(fs.unlinkSync, tmpDirPath)).toThrowError();

    noneStrVals.forEach(function (val) {
      expect(_cb(fs.unlinkSync, val)).toThrowError();
    });

    // Cleans
    expect(fs.rmdirSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(false);
  });

  // Write and Read

  test('write_and_read', function () {
    var tmpTxtPath = os.makeTmpPath('fs-writefile_', '.txt');
    var readTxt;

    // UTF-8
    fs.writeFileSync(tmpTxtPath, textBodyCRLF, { encoding: 'utf8' });
    readTxt = fs.readFileSync(tmpTxtPath, { encoding: 'utf8' });
    expect(readTxt).toBe(textBodyCRLF);
    readTxt = fs.readFileSync(tmpTxtPath, { encoding: 'sjis' });
    expect(readTxt).not.toBe(textBodyCRLF);

    // UTF-8 BOM
    fs.writeFileSync(tmpTxtPath, textBodyCRLF, { encoding: 'utf8', bom: true });
    readTxt = fs.readFileSync(tmpTxtPath, { encoding: 'utf8' });
    expect(readTxt).toBe(textBodyCRLF);

    // CP932 (Shift-JIS)
    fs.writeFileSync(tmpTxtPath, textBodyCRLF, { encoding: 'sjis' });
    readTxt = fs.readFileSync(tmpTxtPath, { encoding: 'sjis' });
    expect(readTxt).toBe(textBodyCRLF);
    readTxt = fs.readFileSync(tmpTxtPath, { encoding: 'utf8' });
    expect(readTxt).not.toBe(textBodyCRLF);

    // Unicode = UTF-16 LE
    fs.writeFileSync(tmpTxtPath, textBodyCRLF, { encoding: 'utf16' });
    readTxt = fs.readFileSync(tmpTxtPath, { encoding: 'utf16' });
    expect(readTxt).toBe(textBodyCRLF);
    readTxt = fs.readFileSync(tmpTxtPath, { encoding: 'utf8' });
    expect(readTxt).not.toBe(textBodyCRLF);

    // No optiongs, If data is string -> UTF16LE(UTF-16 LE noBOM)
    fs.writeFileSync(tmpTxtPath, textBodyCRLF);
    readTxt = fs.readFileSync(tmpTxtPath); // Read as binary
    expect(readTxt).not.toBe(textBodyCRLF); // Error

    readTxt = fs.readFileSync(tmpTxtPath, { encoding: 'utf16' });
    expect(readTxt).toBe(textBodyCRLF);

    // @TODO Handling a binary data

    // Cleans
    fs.unlinkSync(tmpTxtPath);

    noneStrVals.forEach(function (val) {
      expect(_cb(fs.writeFileSync, val)).toThrowError();
      expect(_cb(fs.readFileSync, val)).toThrowError();
    });
  });
});
