# WshFileSystem

Defines `Wsh.FileSystem` and `Wsh.FileSystemExtra` objects, and it contains useful functions to handle files and directories. (similar to Node.js-FileSystem).

## tuckn/Wsh series dependency

[WshModeJs](https://github.com/tuckn/WshModeJs)  
└─ [WshZLIB](https://github.com/tuckn/WshZLIB)  
&emsp;└─ [WshNet](https://github.com/tuckn/WshNet)  
&emsp;&emsp;└─ [WshChildProcess](https://github.com/tuckn/WshChildProcess)  
&emsp;&emsp;&emsp;└─ [WshProcess](https://github.com/tuckn/WshProcess)  
&emsp;&emsp;&emsp;&emsp;&emsp;└─ WshFileSystem - This repository  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;└─ [WshOS](https://github.com/tuckn/WshOS)  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;└─ [WshPath](https://github.com/tuckn/WshPath)  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;└─ [WshUtil](https://github.com/tuckn/WshUtil)  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;└─ [WshPolyfill](https://github.com/tuckn/WshPolyfill)

The upper layer module can use all the functions of the lower layer module.

## Operating environment

Works on JScript in Windows.

## Installation

(1) Create a directory of your WSH project.

```console
D:\> mkdir MyWshProject
D:\> cd MyWshProject
```

(2) Download this ZIP and unzip or Use the following `git` command.

```console
> git clone https://github.com/tuckn/WshFileSystem.git ./WshModules/WshFileSystem
or
> git submodule add https://github.com/tuckn/WshFileSystem.git ./WshModules/WshFileSystem
```

(3) Create your JScript (.js) file. For Example,

```console
D:\MyWshProject\
├─ MyScript.js <- Your JScript code will be written in this.
└─ WshModules\
    └─ WshFileSystem\
        └─ dist\
          └─ bundle.js
```

I recommend JScript (.js) file encoding to be UTF-8 [BOM, CRLF].

(4) Create your WSF packaging scripts file (.wsf).

```console
D:\MyWshProject\
├─ Run.wsf <- WSH entry file
├─ MyScript.js
└─ WshModules\
    └─ WshFileSystem\
        └─ dist\
          └─ bundle.js
```

And you should include _.../dist/bundle.js_ into the WSF file.
For Example, The content of the above _Run.wsf_ is

```xml
<package>
  <job id = "run">
    <script language="JScript" src="./WshModules/WshFileSystem/dist/bundle.js"></script>
    <script language="JScript" src="./MyScript.js"></script>
  </job>
</package>
```

I recommend this WSH file (.wsf) encoding to be UTF-8 [BOM, CRLF].

Awesome! This WSH configuration allows you to use the following functions in JScript (_.\\MyScript.js_).

## Usage

Now your JScript (_.\\MyScript.js_ ) can use helper functions to handle files.
Following are some examples of the use of `Wsh.FileSystem`.

```js
var fs = Wsh.FileSystem; // Shorthand

// ---------- File Operations ----------

// Creates and removes a directory
fs.mkdirSync('D:\\MyDir');
fs.rmdirSync('D:\\MyDir');

// Copies and removes a file
fs.copyFileSync('D:\\SrcFile.path', 'R:\\DestFile.path');
fs.unlinkSync('D:\\MyFile.path');

// Copies a directory with XCOPY
fs.xcopySync('D:\\SrcDir', 'R:\\DestDir');

// Creates a symbolic-link
fs.linkSync('D:\\MyDir\\BackUp', 'C:\\BackUp-Symlink'); // Requires admin

// ---------- Gets file info ----------

// Checks the file existing
fs.existsSync('D:\\Existing\\File.path'); // true
fs.existsSync('D:\\NonExisting\\File.path'); // false

// Gets information about the file
var stat = fs.statSync('D:\\My Dir\\File.path');
stat.isFile(); // true
stat.isDirectory(); // false
stat.isSymbolicLink(); // false

// Reads the contents of the directory
fs.readdirSync('D:\\testDir');
// Returns: [
//   'fileRoot1.txt',
//   'fileRoot2-Symlink.log', // <SYMLINKD>
//   'fileRoot2.log',
//   'DirBar',
//   'DirBar-Symlink', // <SYMLINKD>
//   'DirFoo' ]

fs.readdirSync('D:\\testDir', { withFileTypes: true });
// Returns: [
//   { name: 'fileRoot1.txt',
//     path: 'D:\\testDir\\fileRoot1.txt',
//     attributes: 32,
//     isDirectory: false,
//     isFile: true,
//     isSymbolicLink: false },
//   ...
//   ..
//   { name: 'DirFoo.txt',
//     path: 'D:\\testDir\\DirFoo',
//     attributes: 16,
//     isDirectory: true,
//     isFile: false,
//     isSymbolicLink: false }]

// ---------- File Read/Write ----------

// Writes a data to the file
fs.writeFileSync('D:\\my-note.txt', 'My note.', { encoding: 'utf8' });
fs.writeFileSync('D:\\MyNote.txt', 'My note.', { encoding: 'sjis' });
fs.writeFileSync('D:\\my-script.wsf', 'WScript.Echo("Foo");', {
  encoding: 'utf8',
  bom: true,
});

// Reads the file
var readText = fs.readFileSync('D:\\MyNote.txt', { encoding: 'sjis' });

// Create a temporary file
var tmpPath = fs.writeTmpFileSync('My Temp', { encoding: 'utf8' });
// Returns: 'C:\\Users\\UserName\\AppData\\Local\\Temp\\fs-writeTmpFileSync_rad6E884.tmp'

// and so on...
```

Following are some examples of the use of `Wsh.FileSystemExtra`.

```js
var fse = Wsh.FileSystemExtra; // Shorthand

// ---------- File Operations ----------

// Creates the directory
fse.ensureDirSync('D:\\MyDir');
fse.ensureDirSync('D:\\MyDir'); // No Error
fse.ensureDirSync('R:\\NonExistingDir\\NewDir'); // Creates 2 directories

// Removes the file or directory
fse.removeSync('D:\\MyFile.path'); // File
fse.removeSync('D:\\MyDir'); // Directory
fse.removeSync('R:\\NonExistingDir'); // A non-existing directory (Non error)

// Copies the file
fse.copySync('D:\\SrcFile.path', 'R:\\DestFile.path');
// Auto creating the directories
fse.copySync('D:\\SrcFile.path', 'R:\\NonExistingDir\\DestFile.path');
// Copies the directory
var src = 'D:\\SrcDir';
var dest = 'R:\\DestDir';
fse.copySync(src, dest);
// Note: Copy everything inside of this directory,
//   not the entire directory itself.
// If you want to copy even the directory itself do the following
var path = Wsh.Path;
fse.copySync(src, path.join(dest, path.basename(src)));

// Unzip Office Open XML (e.g. .xlsx, .docx)
fse.unzipOfficeOpenXML('D:\\MyBook.xlsx', 'R:\\DestDir');
// Result:
//  D:\DestDir\
//  └─ MyBook.xlsx\
//       ├─ ooxml\
//       ├─ docProps\
//       ├─ xl\
//       │  ├─ theme\
//       │  ├─ worksheets\
//       │  └─ _rels\
//       └─ _rels\

// ---------- Gets file info ----------

// Generates the cryptographic hash
fse.calcCryptHash('D:File.txt'); // Default: SHA256
// Returns: 1053ed4aca3f61644f2aeb9be175480321530656653853f10b660652777955dd

fse.calcCryptHash('D:File.txt', 'SHA256');
// Returns: 1053ed4aca3f61644f2aeb9be175480321530656653853f10b660652777955dd

fse.calcCryptHash('D:File.txt', 'MD5');
// Returns: 51d52911dc0b646cfda6bb6a6ffa7525

// Compares two files
fse.compareFilesOfModifiedDate('C:FileA.txt', 'D:FileB.txt'); // by date
// Returns: true or false

fse.isTheSameFile('C:FileA.txt', 'D:FileB.txt', 'MD5'); // by hash
// Returns: true or false

// Recursively reads the contents of the directory
fse.readdirSyncRecursively('D:\\testDir');
// Returns: [
//   'fileRoot1.txt',
//   'fileRoot2-Symlink.log', // <SYMLINKD>
//   'fileRoot2.log',
//   'DirBar',
//   'DirFoo',
//   'DirFoo-Symlink', // <SYMLINKD>
//   'DirBar\\fileBar1.txt',
//   'DirBar\\DirQuux',
//   'DirBar\\DirQuux\\fileQuux1-Symlink.log', // <SYMLINKD>
//   'DirBar\\DirQuux\\fileQuux1.txt' ]

// ---------- File Read/Write ----------

// JSON
var testObj = {
  array: [1, 2, 3],
  bool: false,
  num: 42,
  obj: { a: 'A' },
  str: 'Some string',
};

// Writes
fse.writeJsonSync('D:\\test_sjis.json', testObj, {
  indent: '  ',
  lineEnding: '\r\n',
  encoding: 'sjis',
});
// Reads
var readObj = fse.readJsonSync('D:\\settings.json');

// CSV

var testArray = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  [
    '2020/1/1',
    "'007",
    'Has Space',
    '日本語',
    'I say "Yes!"',
    'Line\nBreak',
    'Foo,Bar,Baz',
  ],
];

// Writes
fse.writeCsvSync('D:\\test.csv', testArray);
// Reads
var readArray = fse.readCsvSync('D:\\logs.csv', { encoding: 'utf8' });

// and so on...
```

Many other functions will be added.
See the [documentation](https://tuckn.net/docs/WshFileSystem/) for more details.

### Dependency Modules

You can also use the following valuable functions in _.\\MyScript.js_ (JScript).

- [tuckn/WshPolyfill](https://github.com/tuckn/WshPolyfill)
- [tuckn/WshUtil](https://github.com/tuckn/WshUtil)
- [tuckn/WshPath](https://github.com/tuckn/WshPath)
- [tuckn/WshOS](https://github.com/tuckn/WshOS)

## Documentation

See all specifications [here](https://tuckn.net/docs/WshFileSystem/) and also below.

- [WshPolyfill](https://tuckn.net/docs/WshPolyfill/)
- [WshUtil](https://tuckn.net/docs/WshUtil/)
- [WshPath](https://tuckn.net/docs/WshPath/)
- [WshOS](https://tuckn.net/docs/WshOS/)

## License

MIT

Copyright (c) 2020 [Tuckn](https://github.com/tuckn)
