const path = require('node:path');
const fs = require('node:fs');
const glob = require('fast-glob');
const colors = require('picocolors');
/** @typedef {import('../misc/vbLoader').AssetList} AssetList */


const ASSETS_PATH = path.resolve(__dirname, '..', '..', '..', 'assets', 'game-dev');
process.chdir(ASSETS_PATH);

function main() {
    /** @type {AssetList} */
    let assets = {}
    if (fs.existsSync('assets-list.json') && fs.lstatSync('assets-list.json').isFile()) {
        assets = JSON.parse(fs.readFileSync('assets-list.json').toString());
    }
    assets.fileSize = 0;
    get_img_list(assets);
    get_spine_list(assets);
    get_sound_list(assets);
    get_style_list(assets);
    get_lang_list(assets);
    if (!('custom' in assets)) {
        assets.custom = { fileSize:1 };
    }
    assets.fileSize += assets.custom.fileSize;
    fs.writeFileSync('assets-list.json', JSON.stringify(assets, null, 2));
}

/**
 * load a texture packer json and check if there is any related multi packs,
 * if so, return a list of file paths of those.
 * @param {path.ParsedPath} atlasPathInfo 
 */
function get_multipacks(atlasPathInfo) {
    let multipacks_stem = [];
    let multipacks_name = [];
    const data = JSON.parse(fs.readFileSync(
        path.resolve(atlasPathInfo.dir, atlasPathInfo.base)
        ).toString());
    try {
        let multipacks_data = data['meta']['related_multi_packs'];
        for (let filename of multipacks_data) {
            multipacks_stem.push(path.parse(filename).name);
            multipacks_name.push(filename);
        }
    }
    catch (err) {}
    return [multipacks_stem, multipacks_name];
}

/** @param {AssetList} assets */
function get_img_list(assets) {
    const filelist = glob.sync('img/**/*');
    /* for single image files */
    let imglist = {};
    /* for texture atlas file */
    let atlaslist = {};
    let multipacks = {};
    /* filenames (without ext) of texture atlas */
    let _atlasnames = new Set();
    // filesize
    let img_filesize = 0;
    let atlas_filesize = 0;

    // firstly find all the json files for texture atlas
    // the corresponding images should not be included in 'img'
    for (let filepath of filelist) {
        atlas_filesize += fs.lstatSync(filepath).size;
        let pathInfo = path.parse(filepath);
        if (pathInfo.ext != '.json') continue;
        if (_atlasnames.has(pathInfo.name)) continue;
        // only keep the name, without suffix
        _atlasnames.add(pathInfo.name);
        // complete path with suffix
        atlaslist[pathInfo.name] = filepath;

        let [multipacks_stem, multipacks_name] = get_multipacks(pathInfo);
        if (multipacks_name.length > 0) {
            // is a multipack, only need to add the first json file
            multipacks_stem.forEach(filename => _atlasnames.add(filename));
            multipacks[pathInfo.name] = multipacks_stem;
        }
    }
    
    // find all images, excluding texture atlas
    for (let filepath of filelist) {
        let pathInfo = path.parse(filepath);
        if (_atlasnames.has(pathInfo.name)) continue;
        img_filesize += fs.lstatSync(filepath).size;
        imglist[pathInfo.name] = filepath;
    }
    
    assets.fileSize += atlas_filesize;
    atlas_filesize -= img_filesize;
    imglist.fileSize = img_filesize;
    atlaslist.fileSize = atlas_filesize;
    assets.img = imglist;
    assets.img_atlas = atlaslist;
    assets.img_atlas_multipacks = multipacks;
}

/** @param {AssetList} assets */
function get_spine_list(assets) {
    const filelist = glob.sync('spine/*/*');
    let spinelist = {};
    let filesize = 0;

    for (let filepath of filelist) {
        filesize += fs.lstatSync(filepath).size;
        if (path.extname(filepath) == '.json') {
            spinelist[filepath.split('/')[1]] = filepath;
        }
    }
    assets.fileSize += spinelist.fileSize = filesize;
    assets.spine_json = spinelist;
}

/** @param {AssetList} assets */
function get_sound_list(assets) {
    const filelist = glob.sync('sound/**/*');
    let soundlist = {};
    let filesize = 0;

    for (let filepath of filelist) {
        filesize += fs.lstatSync(filepath).size;
        soundlist[path.parse(filepath).name] = filepath;
    }
    assets.fileSize += soundlist.fileSize = filesize;
    assets.sound = soundlist;
}

/** @param {AssetList} assets */
function get_style_list(assets) {
    const filelist = glob.sync('../style/*.json');
    let jsonlist = {};
    let filesize = 0;

    for (let filepath of filelist) {
        filesize += fs.lstatSync(filepath).size;
        let name = path.parse(filepath).name;
        jsonlist[name] = `style/${name}.json`;
    }
    assets.fileSize += jsonlist.fileSize = filesize;
    assets.style = {
        DEV: jsonlist,
        PROD: { 'styleBundle':'json/view-style.json', fileSize:filesize }
    };
}

/** @param {AssetList} assets */
function get_lang_list(assets) {
    const filelist = glob.sync('../lang/*/game.json');
    let langlist = {}
    let filesize = 0
    for (let filepath of filelist) {
        filesize += fs.lstatSync(filepath).size;
        let code = filepath.split('/')[2];
        langlist[code] = `lang/${code}/game.json`;
    }
    assets.fileSize += langlist.fileSize = filesize;
    assets.lang = {
        DEV: langlist,
        PROD: { 'langBundle': 'json/lang-game.json', fileSize:filesize }
    };
}


try {
    main();
    console.log(colors.green('Command finished.'));
}
catch (err) {
    console.log(colors.yellow(err.stack ? err.stack : err.message));
}