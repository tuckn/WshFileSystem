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
var util = Wsh.Util;
var path = Wsh.Path;
var os = Wsh.OS;
var fs = Wsh.FileSystem;
var fse = Wsh.FileSystemExtra;

var isSolidString = util.isSolidString;
var CERTUTIL = os.exefiles.certutil;

var _cb = function (fn/* , args */) {
  var args = Array.from(arguments).slice(1);
  return function () { fn.apply(null, args); };
};

describe('FileSystemExtra', function () {
  var sample1CsvSjisCRLF = path.join(__dirname, 'assets', 'Sample1_SjisCRLF.csv');
  var sample1CsvUtf8bomCRLF = path.join(__dirname, 'assets', 'Sample1_Utf8bomCRLF.csv');
  var bookXlsx = path.join(__dirname, 'assets', 'Book1.xlsx');
  var noneStrVals = [true, false, undefined, null, 0, 1, NaN, Infinity, [], {}];

  test('ensureDirSync, removeSync', function () {
    var tmpDirPath = os.makeTmpPath('test-ensureDirSync_dir_');

    expect(fs.existsSync(tmpDirPath)).toBe(false);
    expect(fse.ensureDirSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(true);
    expect(fse.ensureDirSync(tmpDirPath)).toBe(undefined); // again

    expect(fse.removeSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(false);
    expect(fse.removeSync(tmpDirPath)).toBe(undefined); // again

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.ensureDirSync, val)).toThrowError();
      expect(_cb(fse.removeSync, val)).toThrowError();
    });
  });

  test('copy/removeSync', function () {
    var tmpDirPath = os.makeTmpPath('test-copySync_dir_');
    expect(fs.existsSync(tmpDirPath)).toBe(false);
    expect(fse.ensureDirSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(true);

    // Copy a file
    var tmpFilePath = path.join(tmpDirPath, 'tmp-file.wsf');
    expect(fs.existsSync(tmpFilePath)).toBe(false);
    expect(fse.copySync(__filename, tmpFilePath)).toBe(undefined);
    expect(fs.existsSync(tmpFilePath)).toBe(true);
    expect(fse.copySync(__filename, tmpFilePath)).toBe(undefined); // again
    expect(_cb(fse.copySync, __filename, tmpFilePath, {
      overwrite: false, errorOnExist: true })).toThrowError();

    // Copy the file into none existing directory
    var tmpDeepFilePath = path.join(tmpDirPath, 'Foo', 'Bar', 'tmp-file.wsf');
    expect(fs.existsSync(tmpDeepFilePath)).toBe(false);
    expect(fse.copySync(__filename, tmpDeepFilePath)).toBe(undefined);
    expect(fs.existsSync(tmpDeepFilePath)).toBe(true);

    // Copy the directory
    var tmpCopiedDir = os.makeTmpPath('test-copySync_copied-dir_');
    expect(fs.existsSync(tmpCopiedDir)).toBe(false);
    expect(fse.copySync(tmpDirPath, tmpCopiedDir)).toBe(undefined);
    expect(fs.existsSync(tmpCopiedDir)).toBe(true);
    expect(fse.copySync(tmpDirPath, tmpCopiedDir)).toBe(undefined); // again
    expect(_cb(fse.copySync, tmpDirPath, tmpCopiedDir, {
      overwrite: false, errorOnExist: true })).toThrowError();

    // Copy the directory into none existing directory
    var tmpDeepDirPath = path.join(tmpCopiedDir, 'Piyo', 'Hoge', 'Boo');
    expect(fs.existsSync(tmpDeepDirPath)).toBe(false);
    expect(fse.copySync(tmpDirPath, tmpDeepDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDeepDirPath)).toBe(true);

    // Filter
    var tmpNoCopyFile = path.join(tmpDirPath, 'will-not.copy');
    expect(fs.existsSync(tmpNoCopyFile)).toBe(false);
    expect(fse.copySync(__filename, tmpNoCopyFile, {
      filter: function () { return false; } })).toBe(undefined);
    expect(fs.existsSync(tmpNoCopyFile)).toBe(false);

    // Clean
    expect(fse.removeSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(false);

    expect(fse.removeSync(tmpCopiedDir)).toBe(undefined);
    expect(fs.existsSync(tmpCopiedDir)).toBe(false);

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.copySync, val, val)).toThrowError();
    });
  });

  test('unzipOfficeOpenXML', function () {
    var tmpDirPath = os.makeTmpPath('test-unzipOfficeOpenXML_');
    fs.mkdirSync(tmpDirPath);

    var dirToUnzip = fse.unzipOfficeOpenXML(bookXlsx, tmpDirPath);
    expect(fs.existsSync(dirToUnzip)).toBe(true);

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.unzipOfficeOpenXML, val)).toThrowError();
    });

    // Cleans
    expect(fse.removeSync(tmpDirPath)).toBe(undefined);
    expect(fs.existsSync(tmpDirPath)).toBe(false);
  });

  test('ensureReadingFile', function () {
    expect('@TODO').toBe('tested');

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.ensureReadingFile, val)).toThrowError();
    });
  });

  test('ensureRemovingFile', function () {
    expect('@TODO').toBe('tested');

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.ensureRemovingFile, val)).toThrowError();
    });
  });

  test('read/writeJsonSync', function () {
    var tmpJsonPath = os.makeTmpPath('fse-jsonSync_', '.json');
    var readObj;

    var testObj = {
      array: [1, 2, 3],
      bool: false,
      float: 3.14,
      num: 42,
      obj: { a: 'A' },
      str: 'Some string',
      nu: null
    };

    // No optiongs -> UTF-8
    expect(fse.writeJsonSync(tmpJsonPath, testObj)).toBe(undefined);
    readObj = fse.readJsonSync(tmpJsonPath); // UTF-8
    expect(readObj).toEqual(testObj);

    readObj = fse.readJsonSync(tmpJsonPath, { encoding: 'utf8' }); // OK
    expect(readObj).toEqual(testObj);

    expect(_cb(fse.readJsonSync, tmpJsonPath, { encoding: 'utf16' })) // NG
        .toThrowError();

    readObj = fse.readJsonSync(tmpJsonPath, { encoding: 'sjis' }); // OK
    expect(readObj).toEqual(testObj);

    // UTF-8
    expect(fse.writeJsonSync(tmpJsonPath, testObj, { encoding: 'utf8' }))
        .toBe(undefined);
    readObj = fse.readJsonSync(tmpJsonPath);
    expect(readObj).toEqual(testObj);

    readObj = fse.readJsonSync(tmpJsonPath, { encoding: 'utf8' }); // OK
    expect(readObj).toEqual(testObj);

    expect(_cb(fse.readJsonSync, tmpJsonPath, { encoding: 'utf16' })) // NG
        .toThrowError();

    readObj = fse.readJsonSync(tmpJsonPath, { encoding: 'sjis' }); // OK
    expect(readObj).toEqual(testObj);

    // UTF-8 BOM
    expect(fse.writeJsonSync(tmpJsonPath, testObj,
      { encoding: 'utf8', bom: true })).toBe(undefined);
    readObj = fse.readJsonSync(tmpJsonPath);
    expect(readObj).toEqual(testObj);

    readObj = fse.readJsonSync(tmpJsonPath, { encoding: 'utf8' }); // OK
    expect(readObj).toEqual(testObj);

    expect(_cb(fse.readJsonSync, tmpJsonPath, { encoding: 'utf16' })) // NG
        .toThrowError();

    expect(_cb(fse.readJsonSync, tmpJsonPath, { encoding: 'sjis' })) // NG
        .toThrowError();

    // Unicode = UTF-16 LE
    expect(fse.writeJsonSync(tmpJsonPath, testObj, { encoding: 'utf16' }))
        .toBe(undefined);

    expect(_cb(fse.readJsonSync, tmpJsonPath)).toThrowError(); // NG

    expect(_cb(fse.readJsonSync, tmpJsonPath, { encoding: 'utf8' }))
        .toThrowError(); // NG

    readObj = fse.readJsonSync(tmpJsonPath, { encoding: 'utf16' }); // OK
    expect(readObj).toEqual(testObj);

    expect(_cb(fse.readJsonSync, tmpJsonPath, { encoding: 'sjis' }))
        .toThrowError(); // NG

    // CP932 (Shift-JIS)
    expect(fse.writeJsonSync(tmpJsonPath, testObj, { encoding: 'sjis' }))
        .toBe(undefined);
    readObj = fse.readJsonSync(tmpJsonPath);
    expect(readObj).toEqual(testObj);

    readObj = fse.readJsonSync(tmpJsonPath, { encoding: 'utf8' }); // OK
    expect(readObj).toEqual(testObj);

    expect(_cb(fse.readJsonSync, tmpJsonPath, { encoding: 'utf16' })) // NG
        .toThrowError();

    readObj = fse.readJsonSync(tmpJsonPath, { encoding: 'sjis' }); // OK
    expect(readObj).toEqual(testObj);

    var testObjJp = {
      strHira: 'あかさたなはまやらわんぁぃぅぇお',
      strKanji: '臨兵闘者皆陣烈在前',
      strRoma: 'ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ'
    };

    // No optiongs -> UTF-8
    expect(fse.writeJsonSync(tmpJsonPath, testObjJp)).toEqual(undefined);
    readObj = fse.readJsonSync(tmpJsonPath); // UTF-8
    expect(readObj).toEqual(testObjJp);

    readObj = fse.readJsonSync(tmpJsonPath, { encoding: 'utf8' });
    expect(readObj).toEqual(testObjJp);

    expect(_cb(fse.readJsonSync, tmpJsonPath, { encoding: 'utf16' }))
        .toThrowError();
    expect(_cb(fse.readJsonSync, tmpJsonPath, { encoding: 'sjis' }))
        .toThrowError();

    // Clean
    fse.removeSync(tmpJsonPath);

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.writeJsonSync, val)).toThrowError();
      expect(_cb(fse.readJsonSync, val)).toThrowError();
    });
  });

  test('writeCsvSync', function () {
    var tmpCsvPath = os.makeTmpPath('fse-csvSync_', '.csv');
    var readCsv;

    var testArray = [
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      ['2020/1/1', '\'007', 'Has Space', '日本語', 'I say "Oops!"', 'Line\nBreak', 'Foo,Bar,Baz'],
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']
    ];

    // No optiongs -> UTF-8 + BOM (Excel can not read utf8 without BOM)
    expect(fse.writeCsvSync(tmpCsvPath, testArray)).toBe(undefined);
    readCsv = fse.readCsvSync(tmpCsvPath);
    expect(readCsv).toEqual([
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      ['2020/1/1', '\'007', 'Has Space', '日本語', 'I say "Oops!"', 'Line\nBreak', 'Foo,Bar,Baz'],
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']
    ]);

    // Cleans
    fse.removeSync(tmpCsvPath);

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.writeCsvSync, val)).toThrowError();
      expect(_cb(fse.readCsvSync, val)).toThrowError();
    });
  });

  test('readCsvSync', function () {
    var readCsv;
    var expected = [
      ['This CSV was output from Tuckn Hoge system'],
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
      ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'],
      ['=SUM(X1:Y10)',
        '=TODAY()',
        '2020/1/1',
        '\'007',
        'Has Space',
        '日本語',
        'I say "Yes!"',
        '"Line\r\nBreak"']
    ];

    readCsv = fse.readCsvSync(sample1CsvUtf8bomCRLF);
    expect(readCsv).toEqual(expected);

    readCsv = fse.readCsvSync(sample1CsvUtf8bomCRLF, { encoding: 'utf8' });
    expect(readCsv).toEqual(expected);

    readCsv = fse.readCsvSync(sample1CsvSjisCRLF, { encoding: 'sjis' });
    expect(readCsv).toEqual(expected);

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.readCsvSync, val)).toThrowError();
    });
  });

  test('readCsvFileAsAssocArray', function () {
    var readObj;
    var expected = [
      {
        A: '0',
        B: '1',
        C: '2',
        D: '3',
        E: '4',
        F: '5',
        G: '6',
        H: '7',
        I: '8',
        J: '9',
        K: '10',
        L: '11'
      },
      {
        A: 'a',
        B: 'b',
        C: 'c',
        D: 'd',
        E: 'e',
        F: 'f',
        G: 'g',
        H: 'h',
        I: 'i',
        J: 'j',
        K: 'k',
        L: 'l'
      },
      {
        A: 'true',
        B: 'false',
        C: 'null',
        D: 'undefined',
        E: 'NaN',
        F: 'Infinity',
        G: undefined,
        H: undefined,
        I: undefined,
        J: undefined,
        K: undefined,
        L: undefined
      },
      {
        A: '=SUM(X1:Y10)',
        B: '=TODAY()',
        C: '2020/1/1',
        D: '\'007',
        E: 'Has Space',
        F: '日本語',
        G: 'I say "Yes!"',
        H: '"Line\r\nBreak"',
        I: undefined,
        J: undefined,
        K: undefined,
        L: undefined
      }
    ];

    readObj = fse.readCsvFileAsAssocArray(sample1CsvUtf8bomCRLF, { beginRow: 2 });
    expect(readObj).toEqual(expected);

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.readCsvFileAsAssocArray, val)).toThrowError();
    });
  });

  test('findRequiredFile', function () {
    // var rtnPath;
    // rtnPath = fse.findRequiredFile('./package.json');
    // console.dir(rtnPath);
    //
    // rtnPath = fse.findRequiredFile('.\\package.json');
    // console.dir(rtnPath);

    expect('@TODO').toBe('tested');

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.findRequiredFile, val)).toThrowError();
    });
  });

  test('dirTree', function () {
    expect('@TODO').toBe('tested');

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.dirTree, val)).toThrowError();
    });
  });

  test('readdirSyncRecursively', function () {
    /*
     * @note A structure to test
     *   %TEMP%fse-readdirRecursively_xxxxx\
     *   │  fileRoot1.txt
     *   │  fileRoot2-Symlink.log
     *   │  fileRoot2.log
     *   │
     *   ├─DirBar\
     *   │  │  fileBar1.txt
     *   │  │
     *   │  └─DirQuux\
     *   │          fileQuux1-Symlink.log
     *   │          fileQuux1.txt
     *   │
     *   ├─DirFoo\
     *   └─DirFoo-Symlink\
     */
    // Root
    var preName = 'fse-readdirRecursively_';
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
    var dirFooSym = path.join(testDir, 'DirFoo-Symlink');
    // Creates
    fs.mkdirSync(dirFoo);
    fs.linkSync(dirFoo, dirFooSym);

    // DirBar
    var dirBar = path.join(testDir, 'DirBar');
    var fileBar1 = path.join(dirBar, 'fileBar1.txt');
    var dirQuux = path.join(dirBar, 'DirQuux');
    var fileQuux1 = path.join(dirQuux, 'fileQuux1.txt');
    var fileQuux1Sym = path.join(dirQuux, 'fileQuux1-Symlink.log');
    // Creates
    fse.ensureDirSync(dirQuux);
    fs.writeFileSync(fileBar1, 'fileBar1');
    fs.writeFileSync(fileQuux1, 'fileQuux1');
    fs.linkSync(fileQuux1, fileQuux1Sym);

    var dirInfo;

    // Non options
    dirInfo = fse.readdirSyncRecursively(testDir);
    expect(dirInfo).toEqual([
      'fileRoot1.txt',
      'fileRoot2-Symlink.log', // <SYMLINKD>
      'fileRoot2.log',
      'DirBar',
      'DirFoo',
      'DirFoo-Symlink', // <SYMLINKD>
      'DirBar\\fileBar1.txt',
      'DirBar\\DirQuux',
      'DirBar\\DirQuux\\fileQuux1-Symlink.log', // <SYMLINKD>
      'DirBar\\DirQuux\\fileQuux1.txt'
    ]);

    // Only files
    dirInfo = fse.readdirSyncRecursively(testDir, { isOnlyFile: true });
    expect(dirInfo).toEqual([
      'fileRoot1.txt',
      'fileRoot2-Symlink.log', // <SYMLINKD>
      'fileRoot2.log',
      'DirBar\\fileBar1.txt',
      'DirBar\\DirQuux\\fileQuux1-Symlink.log', // <SYMLINKD>
      'DirBar\\DirQuux\\fileQuux1.txt'
    ]);

    // Only directories
    dirInfo = fse.readdirSyncRecursively(testDir, { isOnlyDir: true });
    expect(dirInfo).toEqual([
      'DirBar',
      'DirFoo',
      'DirFoo-Symlink', // <SYMLINKD>
      'DirBar\\DirQuux'
    ]);

    // Excludes symlinks
    dirInfo = fse.readdirSyncRecursively(testDir, { excludesSymlink: true });
    expect(dirInfo).toEqual([
      'fileRoot1.txt',
      'fileRoot2.log',
      'DirBar',
      'DirFoo',
      'DirBar\\fileBar1.txt',
      'DirBar\\DirQuux',
      'DirBar\\DirQuux\\fileQuux1.txt'
    ]);

    // Matcher Options
    dirInfo = fse.readdirSyncRecursively(testDir, {
      matchedRegExp: '\\d+\\.txt$'
    });
    expect(dirInfo).toEqual([
      'fileRoot1.txt',
      'DirBar\\fileBar1.txt',
      'DirBar\\DirQuux\\fileQuux1.txt'
    ]);

    dirInfo = fse.readdirSyncRecursively(testDir, {
      matchedRegExp: '\\d+\\.txt$',
      ignoredRegExp: 'Bar'
    });
    expect(dirInfo).toEqual(['fileRoot1.txt']);

    // Not include the parent directory names as the  string of matching
    dirInfo = fse.readdirSyncRecursively(testDir, {
      ignoredRegExp: preName
    });
    expect(dirInfo.length > 0).toBeTruthy();

    // Get even info
    dirInfo = fse.readdirSyncRecursively(testDir, { withFileTypes: true });

    expect(dirInfo).toHaveLength(10);

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
    expect(dirInfo[1].isSymbolicLink).toBe(true);

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

    expect(dirInfo[4].name).toBe('DirFoo');
    expect(dirInfo[4].path).toBe(dirFoo);
    expect(dirInfo[4].attributes).toBe(FILE_ATTRIBUTE_DIRECTORY);
    expect(dirInfo[4].isDirectory).toBe(true);
    expect(dirInfo[4].isFile).toBe(false);
    expect(dirInfo[4].isSymbolicLink).toBe(false);

    expect(dirInfo[5].name).toBe('DirFoo-Symlink');
    expect(dirInfo[5].path).toBe(dirFooSym);
    expect(dirInfo[5].attributes).toBe(FILE_ATTRIBUTE_SYMLINKD_DIR);
    expect(dirInfo[5].isDirectory).toBe(true);
    expect(dirInfo[5].isFile).toBe(false);
    expect(dirInfo[5].isSymbolicLink).toBe(true); // true

    expect(dirInfo[6].name).toBe('DirBar\\fileBar1.txt');
    expect(dirInfo[6].path).toBe(fileBar1);
    expect(dirInfo[6].attributes).toBe(32);
    expect(dirInfo[6].isDirectory).toBe(false);
    expect(dirInfo[6].isFile).toBe(true);
    expect(dirInfo[6].isSymbolicLink).toBe(false);

    expect(dirInfo[7].name).toBe('DirBar\\DirQuux');
    expect(dirInfo[7].path).toBe(dirQuux);
    expect(dirInfo[7].attributes).toBe(FILE_ATTRIBUTE_DIRECTORY);
    expect(dirInfo[7].isDirectory).toBe(true);
    expect(dirInfo[7].isFile).toBe(false);
    expect(dirInfo[7].isSymbolicLink).toBe(false);

    expect(dirInfo[8].name).toBe('DirBar\\DirQuux\\fileQuux1-Symlink.log');
    expect(dirInfo[8].path).toBe(fileQuux1Sym);
    expect(dirInfo[8].attributes).toBe(FILE_ATTRIBUTE_SYMLINKD_FILE);
    expect(dirInfo[8].isDirectory).toBe(false);
    expect(dirInfo[8].isFile).toBe(true);
    expect(dirInfo[8].isSymbolicLink).toBe(true); // true

    expect(dirInfo[9].name).toBe('DirBar\\DirQuux\\fileQuux1.txt');
    expect(dirInfo[9].path).toBe(fileQuux1);
    expect(dirInfo[9].attributes).toBe(32);
    expect(dirInfo[9].isDirectory).toBe(false);
    expect(dirInfo[9].isFile).toBe(true);
    expect(dirInfo[9].isSymbolicLink).toBe(false);

    // Clean
    fse.removeSync(testDir);

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.readdirSyncRecursively, val)).toThrowError();
    });
  });

  test('readdirSyncRecursivelyWithDIR', function () {
    expect('@TODO').toBe('tested');

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.readdirSyncRecursivelyWithDIR, val)).toThrowError();
    });
  });

  test('getTruePath', function () {
    expect('@TODO').toBe('tested');

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.getTruePath, val)).toThrowError();
    });
  });

  test('calcCryptHash', function () {
    var testDir = os.makeTmpPath('fse-isTheSameFile_');
    var file1A = path.join(testDir, 'file1A.txt');
    var hash;

    // Create
    fs.mkdirSync(testDir);
    fs.writeFileSync(file1A, 'file1');

    // dry-run
    var retVal = fse.calcCryptHash(file1A, 'SHA256', { isDryRun: true });
    expect(retVal).toContain(CERTUTIL + ' -hashfile ' + file1A + ' SHA256');

    hash = fse.calcCryptHash(file1A, 'SHA256');
    expect(isSolidString(hash)).toBe(true);

    hash = fse.calcCryptHash(file1A, 'MD5');
    expect(isSolidString(hash)).toBe(true);

    expect(fse.calcCryptHash(file1A, 'md5')).toBe(hash);

    // Cleans
    fse.removeSync(testDir);

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.calcCryptHash, val)).toThrowError();
    });
  });

  test('isTheSameFile, compareFilesOfModifiedDate', function () {
    var testDir = os.makeTmpPath('fse-isTheSameFile_');
    var file1A = path.join(testDir, 'file1A.txt');
    var file1B = path.join(testDir, 'file1B.log');
    var file1C = path.join(testDir, 'file1C.txt');
    var file1D = path.join(testDir, 'file1D.txt');
    var file2 = path.join(testDir, 'file2.txt');

    // Create
    fs.mkdirSync(testDir);
    fs.writeFileSync(file1A, 'file1', { encoding: 'utf8' });
    WScript.Sleep(5000); // Slide create date
    fs.writeFileSync(file1B, 'file1', { encoding: 'utf8' });
    WScript.Sleep(5000);
    fs.writeFileSync(file1C, 'file1', { encoding: 'sjis' });
    WScript.Sleep(5000);
    fs.writeFileSync(file1D, 'file1', { encoding: 'utf16' });
    WScript.Sleep(5000);
    fs.writeFileSync(file2, 'file2');

    expect(fse.isTheSameFile(file1A, file1A)).toBe(true); // defalut: date
    expect(fse.isTheSameFile(file1A, file1A, 'MD5')).toBe(true);

    expect(fse.isTheSameFile(file1A, file1B)).toBe(false); // defalut: date
    expect(fse.isTheSameFile(file1A, file1B, 'MD5')).toBe(true);

    expect(fse.isTheSameFile(file1A, file1C)).toBe(false); // defalut: date
    expect(fse.isTheSameFile(file1A, file1C, 'MD5')).toBe(true);

    expect(fse.isTheSameFile(file1A, file1D)).toBe(false); // defalut: date
    expect(fse.isTheSameFile(file1A, file1D, 'MD5')).toBe(false);

    expect(fse.isTheSameFile(file1A, file2)).toBe(false); // defalut: date
    expect(fse.isTheSameFile(file1A, file2, 'MD5')).toBe(false);

    // Clean
    fse.removeSync(testDir);

    noneStrVals.forEach(function (val) {
      expect(_cb(fse.isTheSameFile, val)).toThrowError();
    });
  });
});
