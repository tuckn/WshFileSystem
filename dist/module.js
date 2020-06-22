﻿!function(){var CD,util,fso,path,os,insp,obtain,isArray,isNumber,isString,isSolidString,parseDate,startsWith,endsWith,srrd,fs,MODULE_TITLE,throwErrNonExist,throwErrNonStr;Wsh&&Wsh.FileSystem||(Wsh.FileSystem={},CD=Wsh.Constants,util=Wsh.Util,fso=Wsh.FileSystemObject,path=Wsh.Path,os=Wsh.OS,insp=util.inspect,obtain=util.obtainPropVal,isArray=util.isArray,isNumber=util.isNumber,isString=util.isString,isSolidString=util.isSolidString,parseDate=util.createDateString,startsWith=util.startsWith,endsWith=util.endsWith,srrd=os.surroundPath,fs=Wsh.FileSystem,MODULE_TITLE="WshModeJs/FileSystem.js",fs.throwTypeErrorNonExisting=function(moduleTitle,functionName,errVal){throw new Error("Error: ENOENT: no such file or directory\n  at "+functionName+" ("+moduleTitle+")\n  path: "+insp(errVal))},throwErrNonExist=function(functionName,typeErrVal){fs.throwTypeErrorNonExisting(MODULE_TITLE,functionName,typeErrVal)},throwErrNonStr=function(functionName,typeErrVal){util.throwTypeError("string",MODULE_TITLE,functionName,typeErrVal)},fs.constants={F_OK:0,R_OK:4,W_OK:2,X_OK:1,COPYFILE_EXCL:1,O_RDONLY:0,O_WRONLY:1,O_RDWR:2,O_CREAT:256,O_EXCL:1024,O_TRUNC:512,O_APPEND:8,S_IFMT:61440,S_IFREG:32768,S_IFDIR:16384,S_IFCHR:8192,S_IFLNK:40960,UV_FS_COPYFILE_EXCL:1},fs.inspectPathWhetherMAX_PATH=function(fullPath){var pathLen=fullPath.length;if(255<pathLen)throw new Error("Error: [Too long file path!] Over 255 characters\n  at fs.inspectPathWhetherMAX_PATH ("+MODULE_TITLE+")\n "+pathLen+' length "'+fullPath+'"')},fs.mkdirSync=function(dirPath){isString(dirPath)||throwErrNonStr("fs.mkdirSync",dirPath),fs.inspectPathWhetherMAX_PATH(dirPath),fso.CreateFolder(dirPath)},fs.writeFileSync=function(fpath,data,options){isString(fpath)||throwErrNonStr("fs.writeFileSync",fpath),data===undefined&&(data="undefined");var encoding=obtain(options,"encoding","binary"),bom=obtain(options,"bom",!1);/^bin(ary)?$/i.test(encoding)&&isString(data)&&(bom=!(encoding="unicode"));var bomLength,strmNoBom,binNoBom,strm=WScript.CreateObject("ADODB.Stream"),fpathTmp=os.makeTmpPath();try{if(/^bin(ary)?$/i.test(encoding))return strm.Type=CD.ado.types.binary,strm.Open(),strm.Write(data),strm.SaveToFile(fpathTmp,CD.ado.saveCreates.overWrite),strm.Close(),fs.copyFileSync(fpathTmp,fpath),fs.unlinkSync(fpathTmp),void(strm=null);strm.Type=CD.ado.types.text,/utf(-)?8/i.test(encoding)?strm.Charset=CD.ado.charset.utf8:/utf(-)?16/i.test(encoding)?strm.Charset=CD.ado.charset.utf16:/(cp932|sjis|shift([-_])?jis)/i.test(encoding)?strm.Charset=CD.ado.charset.sjis:strm.Charset=encoding,strm.Open(),strm.WriteText(data),!/(utf-|unicode)/i.test(strm.Charset)||bom?(strm.SaveToFile(fpathTmp,CD.ado.saveCreates.overWrite),strm.Close()):bom||(bomLength=strm.Charset===CD.ado.charset.utf8?3:2,strmNoBom=WScript.CreateObject("ADODB.Stream"),strm.Position=0,strm.Type=CD.ado.types.binary,strm.Position=bomLength,binNoBom=strm.Read(CD.ado.reads.all),strm.Close(),strmNoBom.Type=CD.ado.types.binary,strmNoBom.Open(),strmNoBom.Write(binNoBom),strmNoBom.SaveToFile(fpathTmp,CD.ado.saveCreates.overWrite),strmNoBom.Close()),fs.copyFileSync(fpathTmp,fpath),fs.unlinkSync(fpathTmp),strm=null}catch(e){throw new Error(insp(e)+"\n  at fs.writeFileSync ("+MODULE_TITLE+')\n  file: "'+fpath+'"\n  encoding: "'+encoding+'"\n  bom: "'+bom+'"\n  data: '+data)}},fs.writeTmpFileSync=function(data,options){var tmpFilePath=os.makeTmpPath("fs-writeTmpFileSync_");return fs.writeFileSync(tmpFilePath,data,options),tmpFilePath},fs.existsSync=function(fpath){return!!isSolidString(fpath)&&(fs.inspectPathWhetherMAX_PATH(fpath),fso.FileExists(fpath)||fso.FolderExists(fpath))},fs.statSync=function(fpath){return isString(fpath)||throwErrNonStr("fs.statSync",fpath),fs.existsSync(fpath)||throwErrNonExist("fs.statSync",fpath),{isFile:function(){return fso.FileExists(fpath)},isDirectory:function(){return fso.FolderExists(fpath)},isSymbolicLink:function(){var fObj;fso.FileExists(fpath)?fObj=fso.GetFile(fpath):fso.FolderExists(fpath)&&(fObj=fso.GetFolder(fpath));var attr=fObj.Attributes+0;return attr===FILE_ATTRIBUTE_SYMLINKD_DIR||attr===FILE_ATTRIBUTE_SYMLINKD_FILE}}},fs.readFileSync=function(fpath,options){isString(fpath)||throwErrNonStr("fs.readFileSync",fpath),fs.statSync(fpath).isFile()||throwErrNonExist("fs.readFileSync",fpath);var encoding=obtain(options,"encoding","binary"),throws=obtain(options,"throws",!0),strm=WScript.CreateObject("ADODB.Stream"),data="";try{data=/^bin(ary)?$/i.test(encoding)?(strm.Type=CD.ado.types.binary,strm.Open(),strm.LoadFromFile(fpath),strm.Read(CD.ado.reads.all)):(strm.Type=CD.ado.types.text,/latin(-)?1/i.test(encoding)?strm.Charset=CD.ado.charset.latin1:/utf(-)?8/i.test(encoding)?strm.Charset=CD.ado.charset.utf8:/utf(-)?16/i.test(encoding)?strm.Charset=CD.ado.charset.utf16:/(cp932|sjis|shift([-_])?jis)/i.test(encoding)?strm.Charset=CD.ado.charset.sjis:strm.Charset=encoding,strm.Open(),strm.LoadFromFile(fpath),strm.ReadText(CD.ado.reads.all)),strm.Close()}catch(e){if(throws)throw new Error(insp(e)+"\n  at fs.readFileSync ("+MODULE_TITLE+')\n  file: "'+fpath+'"\n  encoding: "'+encoding+'"\n')}return strm=null,data},fs.getChildrenFiles=function(dirPath,options){isString(dirPath)||throwErrNonStr("fs.getChildrenFiles",dirPath),fs.statSync(dirPath).isDirectory()||throwErrNonExist("fs.getChildrenFiles",dirPath);var itm,filename,fullName,isSymlink,fileInfo,prefixDirName=obtain(options,"prefixDirName",""),matchedRegExp=obtain(options,"matchedRegExp",null),mtchRE=isSolidString(matchedRegExp)?new RegExp(matchedRegExp,"i"):null,ignoredRegExp=obtain(options,"ignoredRegExp",null),ignrRE=isSolidString(ignoredRegExp)?new RegExp(ignoredRegExp,"i"):null,ignoresErr=obtain(options,"ignoresErr",!1),excludesSymlink=obtain(options,"excludesSymlink",!1),withFileTypes=obtain(options,"withFileTypes",!1),objDir=fso.GetFolder(path.normalize(dirPath)),enmFile=new Enumerator(objDir.Files),files=[];for(enmFile.moveFirst();!enmFile.atEnd();enmFile.moveNext())if(filename=(itm=enmFile.item()).Name.toString(),fullName=path.join(prefixDirName,filename),(!mtchRE||mtchRE.test(fullName))&&(!ignrRE||!ignrRE.test(fullName)))try{if(withFileTypes){if(isSymlink=fs.statSync(itm.Path).isSymbolicLink(),excludesSymlink&&isSymlink)continue;fileInfo={name:fullName,path:itm.Path,attributes:itm.Attributes,isDirectory:!1,isFile:!0,isSymbolicLink:isSymlink,size:itm.Size,dateCreated:parseDate(null,new Date(itm.DateCreated)),dateModified:parseDate(null,new Date(itm.DateLastModified))}}else{if(excludesSymlink&&fs.statSync(itm.Path).isSymbolicLink())continue;fileInfo=fullName}files.push(fileInfo)}catch(e){if(ignoresErr)continue;throw new Error(insp(e)+"\n  at fs.getChildrenFiles ("+MODULE_TITLE+")")}return files},fs.getChildrenDirectories=function(dirPath,options){var functionName="fs.getChildrenDirectories";isString(dirPath)||throwErrNonStr(functionName,dirPath),fs.statSync(dirPath).isDirectory()||throwErrNonExist(functionName,dirPath);var itm,dirName,fullName,isSymlink,fileInfo,prefixDirName=obtain(options,"prefixDirName",""),matchedRegExp=obtain(options,"matchedRegExp",null),mtchRE=isSolidString(matchedRegExp)?new RegExp(matchedRegExp,"i"):null,ignoredRegExp=obtain(options,"ignoredRegExp",null),ignrRE=isSolidString(ignoredRegExp)?new RegExp(ignoredRegExp,"i"):null,ignoresErr=obtain(options,"ignoresErr",!1),excludesSymlink=obtain(options,"excludesSymlink",!1),withFileTypes=obtain(options,"withFileTypes",!1),objDir=fso.GetFolder(path.normalize(dirPath)),enmDir=new Enumerator(objDir.SubFolders),dirs=[];for(enmDir.moveFirst();!enmDir.atEnd();enmDir.moveNext())if(dirName=(itm=enmDir.item()).Name.toString(),fullName=path.join(prefixDirName,dirName),(!mtchRE||mtchRE.test(fullName))&&(!ignrRE||!ignrRE.test(fullName)))try{if(withFileTypes){if(isSymlink=fs.statSync(itm.Path).isSymbolicLink(),excludesSymlink&&isSymlink)continue;fileInfo={name:fullName,path:itm.Path,attributes:itm.Attributes,isDirectory:!0,isFile:!1,isSymbolicLink:isSymlink,dateCreated:parseDate(null,new Date(itm.DateCreated)),dateModified:parseDate(null,new Date(itm.DateLastModified))}}else{if(excludesSymlink&&fs.statSync(itm.Path).isSymbolicLink())continue;fileInfo=fullName}dirs.push(fileInfo)}catch(e){if(ignoresErr)continue;throw new Error(insp(e)+"\n  at "+functionName+" ("+MODULE_TITLE+")")}return dirs},fs.readdirSync=function(dirPath,options){isString(dirPath)||throwErrNonStr("fs.readdirSync",dirPath),fs.statSync(dirPath).isDirectory()||throwErrNonExist("fs.readdirSync",dirPath);var isOnlyFile=obtain(options,"isOnlyFile",!1),files=[];obtain(options,"isOnlyDir",!1)||(files=fs.getChildrenFiles(dirPath,options));var dirs=[];return isOnlyFile||(dirs=fs.getChildrenDirectories(dirPath,options)),files.concat(dirs)},fs.excludeSymboliclinkPaths=function(filePaths,options){isArray(filePaths)||function(functionName,typeErrVal){util.throwTypeError("array",MODULE_TITLE,functionName,typeErrVal)}("fs.excludeSymboliclinkPaths",filePaths);var ignoresErr=obtain(options,"ignoresErr",!1),symlinkDirs=[];return filePaths.filter(function(fp){for(var i=0,len=symlinkDirs.length;i<len;i++)if(startsWith(fp,symlinkDirs[i],0,"i"))return!1;try{var fstat=fs.statSync(fp);if(fstat.isSymbolicLink())return fstat.isDirectory()&&symlinkDirs.push(fp),!1}catch(e){if(!ignoresErr)throw new Error(insp(e)+"\n  at fs.excludeSymboliclinkPaths ("+MODULE_TITLE+")");return!1}return!0})},fs.getAllChildrensFullPaths=function(dirPath,options){var functionName="fs.getAllChildrensFullPaths";isString(dirPath)||throwErrNonStr(functionName,dirPath),fs.statSync(dirPath).isDirectory()||throwErrNonExist(functionName,dirPath);var args=[path.normalize(dirPath)],args=obtain(options,"isOnlyDir",!1)?args.concat(["/A:D","/B","/N","/S","/O:N"]):args.concat(["/B","/N","/S","/O:N"]),retObj=os.execSync("dir",args,{shell:!0});if(retObj.exitCode!==CD.runs.ok)throw new Error("Error: [Error Exit Code]\n  at "+functionName+" ("+MODULE_TITLE+")\n  mainCmd: dir\n  args: "+insp(args)+"\n  exitCode: "+retObj.exitCode+"\n  stdout: "+retObj.stdout+"\n  stderr: "+retObj.stderr);var fullPaths=retObj.stdout.split("\r\n");return fullPaths.pop(),obtain(options,"excludesSymlink",!1)?fullPaths:fs.excludeSymboliclinkPaths(fullPaths,options)},fs.copyFileSync=function(src,dest,flag){if(isString(src)||throwErrNonStr("fs.copyFileSync",src),isString(dest)||throwErrNonStr("fs.copyFileSync",dest),fs.existsSync(src)||throwErrNonExist("fs.copyFileSync",src),flag===fs.constants.COPYFILE_EXCL&&fs.existsSync(dest))throw new Error("Error: [EXIST]: file already exists\n  at fs.copyFileSync ("+MODULE_TITLE+')\n  copyfile "'+src+'" -> "'+dest+'"');try{fso.CopyFile(src,dest,CD.fso.overwrites.yes)}catch(e){throw new Error(insp(e)+"\n  at fs.copyFileSync ("+MODULE_TITLE+')\n  EPERM: operation not permitted, copyfile "'+src+'" -> "'+dest+'")')}},fs.linkSync=function(existingPath,newPath,msecTimeOut){if(isString(newPath)||throwErrNonStr("fs.linkSync",newPath),isString(existingPath)||throwErrNonStr("fs.linkSync",existingPath),fs.existsSync(newPath))throw new Error("Error: [EXIST]: file of directory already exists\n  at fs.linkSync ("+MODULE_TITLE+')\n  newPath "'+newPath+'"');fs.existsSync(existingPath)||throwErrNonExist("fs.linkSync",existingPath);var args=[],statSrc=fs.statSync(existingPath);if(statSrc.isFile())args=args.concat([newPath,existingPath]);else{if(!statSrc.isDirectory())throw new Error("Error: [Unknwon file type]:\n  at fs.linkSync ("+MODULE_TITLE+')\n  existingPath "'+existingPath+'"');args=args.concat(["/D",newPath,existingPath])}os.runAsAdmin("mklink",args,{shell:!0,winStyle:"hidden"}),msecTimeOut=isNumber(msecTimeOut)?msecTimeOut:1e4;do{try{if(fs.existsSync(newPath))return!0}catch(e){WScript.Sleep(100),msecTimeOut-=100}}while(0<msecTimeOut);return!1},fs.xcopySync=function(src,dest,options){isString(src)||throwErrNonStr("fs.xcopySync",src),isString(dest)||throwErrNonStr("fs.xcopySync",dest),fs.existsSync(src)||throwErrNonExist("fs.xcopySync",src);var argStr="";if(fs.statSync(src).isDirectory()?argStr+=" D|"+os.exefiles.xcopy+" "+srrd(src)+" "+srrd(dest)+" /E /I":argStr+=" F|"+os.exefiles.xcopy+" "+srrd(src)+" "+srrd(dest),argStr+=" /H /R /Y",obtain(options,"withStd",!1)){var retObj=os.execSync("ECHO",argStr,{shell:!0});if(retObj.exitCode===CD.runs.ok)return retObj;throw new Error("Error: [Error Exit Code]\n  at fs.xcopySync ("+MODULE_TITLE+")\n  mainCmd: ECHO\n  argStr: "+argStr+"\n  exitCode: "+retObj.exitCode+"\n  stdout: "+retObj.stdout+"\n  stderr: "+retObj.stderr)}var iRetVal=os.runSync("ECHO",argStr,{shell:!0,winStyle:"hidden"});if(iRetVal!==CD.runs.ok)throw new Error('Error [ExitCode is not Ok] "'+iRetVal+'"\n')},fs.rmdirSync=function(dirPath){isString(dirPath)||throwErrNonStr("fs.rmdirSync",dirPath),fs.statSync(dirPath).isDirectory()||throwErrNonExist("fs.rmdirSync",dirPath);try{fso.DeleteFolder(dirPath,CD.fso.force.yes)}catch(e){try{if(fs.statSync(dirPath).isSymbolicLink())throw e;endsWith(dirPath,path.sep)||(dirPath+=path.sep);var iRetVal=os.runSync("rmdir",["/S","/Q",dirPath],{shell:!0,winStyle:"hidden"});if(iRetVal===CD.runs.ok)return;throw new Error('Error [ExitCode is not Ok] "'+iRetVal+'"\n')}catch(e){throw new Error(insp(e)+"\n  at fs.rmdirSync ("+MODULE_TITLE+')\n  EPERM: operation not permitted, "'+dirPath+'"')}}},fs.unlinkSync=function(fpath){isString(fpath)||throwErrNonStr("fs.unlinkSync",fpath),fs.statSync(fpath).isFile()||throwErrNonExist("fs.unlinkSync",fpath);try{fso.DeleteFile(fpath,CD.fso.force.yes)}catch(e){throw new Error(insp(e)+"\n  at fs.unlinkSync ("+MODULE_TITLE+')\n  EPERM: operation not permitted, unlink "'+fpath+'"')}})}();
!function(){Wsh.FileSystemExtra={};var CD=Wsh.Constants,util=Wsh.Util,fso=Wsh.FileSystemObject,path=Wsh.Path,shApp=Wsh.ShellApplication,os=Wsh.OS,fs=Wsh.FileSystem,objAssign=Object.assign,obtain=util.obtainPropVal,isSolidArray=util.isSolidArray,isSolidString=util.isSolidString,isFunction=util.isFunction,isString=util.isString,hasContent=util.hasContent,hasIn=util.hasIn,insp=util.inspect,srrd=os.surroundPath,fse=Wsh.FileSystemExtra,MODULE_TITLE="WshModeJs/FileSystemExtra.js",throwErrNonStr=function(functionName,typeErrVal){util.throwTypeError("string",MODULE_TITLE,functionName,typeErrVal)},throwErrNonExist=function(functionName,typeErrVal){fs.throwTypeErrorNonExisting(MODULE_TITLE,functionName,typeErrVal)};fse.ensureDirSync=function(dirPath){if(isString(dirPath)||throwErrNonStr("fse.ensureDirSync",dirPath),!fs.existsSync(dirPath)||!fs.statSync(dirPath).isDirectory())for(var dirFullPath=path.normalize(dirPath),layers=dirFullPath.split(path.sep),layer="",i=path.isUNC(dirFullPath)?(layer="\\\\"+layers[2],3):(layer=layers[0],1),I=layers.length;i<I;i++){layer+=path.sep+layers[i];try{if(fs.existsSync(layer)){if(fs.statSync(layer).isDirectory())continue;fs.mkdirSync(layer)}else fs.mkdirSync(layer)}catch(e){throw new Error(insp(e)+"\n  at fse.ensureDirSync ("+MODULE_TITLE+')\n  Failed to create the directory "'+layer+'".\n  dirPath: "'+dirPath+'"')}}},fse.copySync=function(src,dest,options){isString(src)||throwErrNonStr("fse.copySync",src),isString(dest)||throwErrNonStr("fse.copySync",dest),fs.existsSync(src)||throwErrNonExist("fse.copySync",src);var filter=obtain(options,"filter",null);if(!isFunction(filter)||filter(src,dest)){var overwrite=obtain(options,"overwrite",!0),errorOnExist=obtain(options,"errorOnExist",!1);if(overwrite||!fs.existsSync(dest))try{fse.ensureDirSync(path.dirname(dest));var fsstat=fs.statSync(src);if(fsstat.isFile())fso.CopyFile(src,dest,CD.fso.overwrites.yes);else{if(!fsstat.isDirectory())throw new Error('ENOENT: no such file or directory, "'+src+'"\n  at fse.copySync ('+MODULE_TITLE+")");fso.CopyFolder(src,dest,CD.fso.overwrites.yes)}}catch(e){throw new Error(insp(e)+"\n  at fse.copySync ("+MODULE_TITLE+')\n  src: "'+src+'" -> dest: "'+dest+'"')}else if(errorOnExist)throw new Error('Error: [Already Existing] "'+dest+'"/n  at fse.copySync ('+MODULE_TITLE+")")}},fse.unzipOfficeOpenXML=function(srcPath,destDir){isSolidString(srcPath)||throwErrNonStr("fse.unzipOfficeOpenXML",srcPath),isSolidString(destDir)||throwErrNonStr("fse.unzipOfficeOpenXML",destDir),fs.existsSync(srcPath)||throwErrNonExist("fse.unzipOfficeOpenXML",srcPath);var tmpDir=os.makeTmpPath("fse-unzipOfficeOpenXML_");fs.mkdirSync(tmpDir);var srcZipTmp=path.join(tmpDir,path.basename(srcPath)+".zip");fs.copyFileSync(srcPath,srcZipTmp);var destDirTmp=path.join(tmpDir,path.basename(srcPath));fs.mkdirSync(destDirTmp);var objInput=shApp.NameSpace(srcZipTmp);shApp.NameSpace(destDirTmp).CopyHere(objInput.Items(),16);var dirToUnzip=path.join(destDir,path.basename(destDirTmp));return fse.copySync(destDirTmp,dirToUnzip),fse.removeSync(tmpDir),dirToUnzip},fse.removeSync=function(fpath){if(isString(fpath)||throwErrNonStr("fse.removeSync",fpath),fs.existsSync(fpath))try{var fsstat=fs.statSync(fpath);if(fsstat.isFile())fs.unlinkSync(fpath);else{if(!fsstat.isDirectory())throw new Error('ENOENT: no such file or directory, "'+fpath+'"\n  at fse.removeSync ('+MODULE_TITLE+")");fs.rmdirSync(fpath)}}catch(e){throw new Error(insp(e)+' Failed to delete "'+fpath+'"\n  at fse.removeSync ('+MODULE_TITLE+")")}},fse.ensureReadingFile=function(fpath,msecTimeOut,options){hasContent(msecTimeOut)||(msecTimeOut=1e4);var fileData,isInfinity=0===msecTimeOut,isRead=!1;do{try{fileData=fs.readFileSync(fpath,objAssign({},options,{"throws":!0})),isRead=!0}catch(e){if(msecTimeOut-=300,!isInfinity&&msecTimeOut<=0)throw e;WScript.Sleep(300)}}while(!isRead&&(isInfinity||0<msecTimeOut));return fileData},fse.ensureRemovingFile=function(fpath,msecTimeOut){if(!fs.existsSync(fpath))return!0;if(!fs.statSync(fpath).isFile())return!0;hasContent(msecTimeOut)||(msecTimeOut=3e4);do{try{fso.DeleteFile(fpath,CD.fso.force.yes)}catch(e){WScript.Sleep(300),msecTimeOut-=300}}while(fso.FileExists(fpath)&&0<msecTimeOut);return 0<msecTimeOut},fse.writeJsonSync=function(fpJson,obj,options){isString(fpJson)||throwErrNonStr("fse.writeJsonSync",fpJson);var indent=hasIn(options,"indent")?options.indent:4;null!==indent&&indent!==undefined||(indent=4);var txtJson=JSON.stringify(obj,null,indent),lineEnding=obtain(options,"lineEnding","\n");"\n"!==lineEnding&&(txtJson=txtJson.replace(/\n/g,lineEnding));var encoding=obtain(options,"encoding",CD.ado.charset.utf8),bom=obtain(options,"bom",!1);fs.writeFileSync(fpJson,txtJson,{encoding:encoding,bom:bom})},fse.readJsonSync=function(fpJson,options){isString(fpJson)||throwErrNonStr("fse.readJsonSync",fpJson),fs.statSync(fpJson).isFile()||throwErrNonExist("fse.readJsonSync",fpJson);var encoding=obtain(options,"encoding",CD.ado.charset.utf8),throws=obtain(options,"throws",!0),txtJson=fs.readFileSync(fpJson,{encoding:encoding,"throws":throws}),rtnAssoc={};return txtJson&&(rtnAssoc=JSON.parse(txtJson)),rtnAssoc},fse.writeCsvSync=function(csvpath,arrays,options){isSolidString(csvpath)||throwErrNonStr("fse.writeCsvSync",csvpath),isSolidArray(arrays)||function(functionName,typeErrVal){util.throwTypeError("array",MODULE_TITLE,functionName,typeErrVal)}("fse.writeCsvSync",arrays);var stringified=util.stringify2DArrayToCsv(arrays,options),encoding=obtain(options,"encoding",CD.ado.charset.utf8),bom=obtain(options,"bom",!0);fs.writeFileSync(csvpath,stringified,{encoding:encoding,bom:bom})},fse.readCsvSync=function(csvpath,options){fs.existsSync(csvpath)||throwErrNonExist("fse.readCsvSync",csvpath);var encoding=obtain(options,"encoding",CD.ado.charset.utf8),throws=obtain(options,"throws",!0),csvText=fs.readFileSync(csvpath,{encoding:encoding,"throws":throws});return util.parseCsvTo2DArray(csvText,options)},fse.readCsvFileAsAssocArray=function(csvpath,options){fs.existsSync(csvpath)||throwErrNonExist("fse.readCsvFileAsAssocArray",csvpath);var arrays=fse.readCsvSync(csvpath,options);return util.conv2DArrayToObj(arrays,options)},fse.findRequiredFile=function(pathStr,options){var parsed=path.parse(path.normalize(pathStr)),baseDir=parsed.dir,fineName=parsed.base+obtain(options,"ext",""),fileFound="";if(path.isAbsolute(baseDir))return fileFound=path.join(baseDir,fineName);if(!isSolidString(baseDir)&&(fileFound=path.join(__dirname,fineName),fs.existsSync(fileFound)))return fileFound;var partFinding=path.join(baseDir,fineName),fileFound=path.normalize(path.join(__dirname,partFinding));if(fs.existsSync(fileFound))return fileFound;var parentDir=path.dirname(__dirname);if(isSolidString(parentDir)){if(fileFound=path.normalize(path.join(parentDir,partFinding)),fs.existsSync(fileFound))return fileFound;parentDir=path.dirname(parentDir)}return parentDir=os.userInfo().homedir,fileFound=path.normalize(path.join(parentDir,partFinding)),fs.existsSync(fileFound)?fileFound:""},fse.copyWshFilesDefinedInWsf=function(srcWsf,destDir){var srcWsfLines=fs.readFileSync(srcWsf,{encoding:CD.ado.charset.utf8}).split("\n"),foWsf=path.dirname(srcWsf),srcFile="",srcFiles=[],destFiles=[];srcWsfLines.forEach(function(val){/script language="\w+Script" src="/i.test(val)&&(srcFile=val.match(/src="(.+)"><\/script>/i)[1],srcFiles.push(path.resolve(path.join(foWsf,srcFile))),destFiles.push(path.resolve(path.join(destDir,srcFile))))}),srcFiles.forEach(function(src,i){fs.existsSync(src)&&fs.copyFileSync(src,destFiles[i])})},fse.dirTree=function(dirPath,options){isString(dirPath)||throwErrNonStr("fse.dirTree",dirPath),fs.statSync(dirPath).isDirectory()||throwErrNonExist("fse.dirTree",dirPath);var lines=fs.getAllChildrensFullPaths(dirPath,options);lines.pop(),lines.sort(function(a,b){return a<b?-1:b<a?1:0});var dirobj={children:[]},dirPt=dirobj;dirobj.path=dirPath,dirobj.name=path.basename(dirPath),dirobj.type="directory";for(var joinedPath,fileExt,exclude=obtain(options,"exclude",""),regexpExc=isSolidString(exclude)?new RegExp(exclude):null,extensions=obtain(options,"extensions",""),regexpExt=isSolidString(extensions)?new RegExp(extensions):null,names=[],isDefined=!1,i=0,I=lines.length;i<I;i++)if(!regexpExc||!regexpExc.test(lines[i])){dirPt=dirobj,joinedPath=dirPath;for(var j=0,J=(names=lines[i].slice(dirPath.length).replace(/^\\+/,"").split(path.sep)).length;j<J;j++){if(joinedPath=path.join(joinedPath,names[j]),!fs.statSync(joinedPath).isDirectory()){fileExt="."+path.extname(joinedPath).toLowerCase(),(regexpExt||regexpExt.test(fileExt))&&dirPt.children.push({path:joinedPath,name:names[j],type:"file",extension:fileExt});break}if(0===dirPt.children.length)dirPt.children.push({path:joinedPath,name:names[j],type:"directory",children:[]}),dirPt=dirPt.children[0];else{isDefined=!1;for(var k=0,K=dirPt.children.length;k<K;k++)if(dirPt.children[k].name===names[j]&&hasIn(dirPt.children[k],"children")){dirPt=dirPt.children[k],isDefined=!0;break}isDefined||(dirPt.children.push({path:joinedPath,name:names[j],type:"directory",children:[]}),dirPt=dirPt.children[dirPt.children.length-1])}}}return dirobj},fse.readdirSyncRecursively=function(dirPath,options){isString(dirPath)||throwErrNonStr("fse.readdirSyncRecursively",dirPath),fs.statSync(dirPath).isDirectory()||throwErrNonExist("fse.readdirSyncRecursively",dirPath);var rtnFiles=fs.readdirSync(dirPath,options),subDirsNames=fs.readdirSync(dirPath,{prefixDirName:"",isOnlyDir:!0,withFileTypes:!1,ignoresErr:obtain(options,"ignoresErr",!1),excludesSymlink:obtain(options,"excludesSymlink",!1),matchedRegExp:"",ignoredRegExp:""}),prefixDirName=obtain(options,"prefixDirName","");return subDirsNames.forEach(function(dirName){var subFiles=fse.readdirSyncRecursively(path.join(dirPath,dirName),objAssign({},options,{prefixDirName:path.join(prefixDirName,dirName)}));rtnFiles=rtnFiles.concat(subFiles)}),rtnFiles},fse.readdirSyncRecursivelyWithDIR=function(dirPath,options){var functionName="fse.readdirSyncRecursively";isString(dirPath)||throwErrNonStr(functionName,dirPath),fs.statSync(dirPath).isDirectory()||throwErrNonExist(functionName,dirPath);var command="dir "+srrd(dirPath)+" /B /N /S /O:N",exeCmd=srrd(os.exefiles.cmd)+' /S /C"'+command+'"',retObj=os.execSync(exeCmd);if(retObj.exitCode!==CD.runs.ok)throw new Error("Error: [ExitCode is not 0]\n  at "+functionName+" ("+MODULE_TITLE+")\n  command: "+command+"\n  exitCode: "+retObj.exitCode+"\n  stdout: "+retObj.stdout+"\n  stderr: "+retObj.stderr);var fullPaths=retObj.stdout.split("\r\n");fullPaths.pop();var rtnName,isDir,withFileTypes=obtain(options,"withFileTypes",!1),matchedRegExp=obtain(options,"matchedRegExp",null),ignoredRegExp=obtain(options,"ignoredRegExp",null),mtchRE=isSolidString(matchedRegExp)?new RegExp(matchedRegExp,"i"):null,ignrRE=isSolidString(ignoredRegExp)?new RegExp(ignoredRegExp,"i"):null,rtnNames=[];return fullPaths.forEach(function(fullPath){if(rtnName=fullPath.replace(dirPath,"").replace(/^\\/,""),(null===mtchRE||mtchRE.test(rtnName))&&(null===ignrRE||!ignrRE.test(rtnName)))if(withFileTypes){if(!fs.existsSync(fullPath))return;isDir=fs.statSync(fullPath).isDirectory(),rtnNames.push({name:rtnName,path:fullPath,isDirectory:isDir,isFile:!isDir})}else rtnNames.push(rtnName)}),rtnNames},fse.getTruePath=function(fp){path.isAbsolute(fp)},fse.calcCryptHash=function(filepath,algorithm){isString(filepath)||throwErrNonStr("fse.calcCryptHash",filepath),fs.statSync(filepath).isFile()||throwErrNonExist("fse.calcCryptHash",filepath);var retObj,mainCmd=os.exefiles.certutil,algo=isSolidString(algorithm)?algorithm.toUpperCase():"SHA256",args=["-hashfile",filepath,algo];try{if((retObj=os.execSync(mainCmd,args,{shell:!1})).exitCode!==CD.runs.ok)throw new Error("Error: [ExitCode is "+retObj.exitCode+"]\n")}catch(e){var tmpFile=os.tmpFile("fse-calcCryptHash_");if(fse.copySync(filepath,tmpFile),args=["-hashfile",tmpFile,algo],retObj=os.execSync(mainCmd,args,{shell:!1}),fse.removeSync(tmpFile),retObj.exitCode!==CD.runs.ok)throw new Error(insp(e)+"\n  at fse.calcCryptHash ("+MODULE_TITLE+")\n  exitCode: "+retObj.exitCode+"\n  stdout: "+retObj.stdout+"\n  stderr: "+retObj.stderr)}return retObj.stdout.replace(/\r/g,"").split("\n")[1]},fse.compareFilesOfModifiedDate=function(fpA,fpB){fs.statSync(fpA).isFile()||throwErrNonExist("fse.compareFilesOfModifiedDate",fpA),fs.statSync(fpB).isFile()||throwErrNonExist("fse.compareFilesOfModifiedDate",fpB);var srcDate=fso.GetFile(fpA).DateLastModified,destDate=fso.GetFile(fpB).DateLastModified;return Math.abs(Number(srcDate)-Number(destDate))<3e3},fse.isTheSameFile=function(fpA,fpB,algorithm){return fs.statSync(fpA).isFile()||throwErrNonExist("fse.isTheSameFile",fpA),fs.statSync(fpB).isFile()||throwErrNonExist("fse.isTheSameFile",fpB),isSolidString(algorithm)&&"DATE"!==algorithm.toUpperCase()?fse.calcCryptHash(fpA,algorithm)===fse.calcCryptHash(fpB,algorithm):fse.compareFilesOfModifiedDate(fpA,fpB)}}();
