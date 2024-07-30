const file_system = require('fs');
const archiver = require('archiver');

const SystemService = {

    bringWebSettings: () => {
        return {
            websiteName: "Dietitian"
        }
    },

    backup: () => {
        try {
            let Day = new Date().getDate().toString();
            let Month = new Date().getMonth().toString();
            let Year = new Date().getFullYear().toString();

            let backupFileName = Day + '_' + Month + '_' + Year + '_Backup.zip';

            let output = file_system.createWriteStream(backupFileName);
            let archive = archiver('zip');

            output.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
            });

            archive.on('error', function(err){
                throw err;
            });

            archive.pipe(output);

            archive.directory('backend/', 'backend');
            archive.directory('frontend/', 'frontend');

            archive.finalize()
                .then(
                    backup => console.log(backup.toString()))
                .catch(
                    err => console.log(err.toString())
                );

            return {
                backupFileName: backupFileName,
                message:'Backup is successfull.',
            }
        } catch (error) {
            console.log(error.message)
        }
    }

}

module.exports = SystemService;