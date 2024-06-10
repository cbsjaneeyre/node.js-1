/* eslint-disable no-useless-return */
/* eslint-disable array-callback-return */

// node index.js --entry ./src -D

const yargs = require('yargs');
const path = require('path');
const fs = require('fs');

// arguments

const args = yargs
  .usage('Usage: node $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'v')
  .example('node $0 --entry ./path/path --dist ./path/path --delete')
  .option('entry', {
    alias: 'e',
    describe: 'determine the path to the initial directory',
    demandOption: true
  })
  .option('dist', {
    alias: 'd',
    describe: 'where to sort',
    default: './dist'
  })
  .option('delete', {
    alias: 'D',
    describe: 'delete the initial folder',
    boolean: true,
    default: false
  })
  .epilog('first homework')
  .argv;

// sorting books

const config = {
  entry: path.join(__dirname, args.entry),
  dist: path.join(__dirname, args.dist),
  delete: args.delete
};

function createDist (src, callback) {
  fs.mkdir(src, (error) => {
    if (error && error.code === 'EEXIST') {
      callback();
    }

    callback();
  });
}

function bookSorter (src) {
  fs.readdir(src, (error, files) => {
    if (error) throw error;

    files.map((file) => {
      const currentPath = path.join(src, file);

      fs.stat(currentPath, (error, stat) => {
        if (error) throw error;

        if (stat.isDirectory()) {
          bookSorter(currentPath);
        } else {
          createDist(config.dist, () => {
            const folderName = file[0].toUpperCase();
            const newPath = path.join(config.dist, folderName);

            createDist(newPath, () => {
              const finalPath = path.join(newPath, file);

              fs.link(currentPath, finalPath, error => {
                if (error && error.code === 'EEXIST') {
                  return;
                }
              });
            });
          });
        }
      });
    });
  });
}

try {
  bookSorter(config.entry);
} catch (error) {
  console.error(error);
}

// создать путь к папке по имени первой буквы файла
// копировать файл в данную папку
