const file_system = require('fs');
const archiver = require('archiver');

class SystemService {
    static bringWebSettings() {
        return {
            websiteName: "Dietitian"
        };
    }

    static backup() {
        try {
            const currentDate = new Date();
            const Day = currentDate.getDate().toString();
            const Month = (currentDate.getMonth() + 1).toString(); // Month is zero-based
            const Year = currentDate.getFullYear().toString();

            const backupFileName = `${Day}_${Month}_${Year}_Backup.zip`;

            const output = file_system.createWriteStream(backupFileName);
            const archive = archiver('zip');

            output.on('close', () => {
                console.log(`${archive.pointer()} total bytes`);
            });

            archive.on('error', (err) => {
                throw err;
            });

            archive.pipe(output);

            archive.directory('backend/', 'backend');
            archive.directory('frontend/', 'frontend');

            archive.finalize()
                .then(() => {
                    console.log('Backup finalized successfully.');
                })
                .catch((err) => {
                    console.log(`Error during finalization: ${err.toString()}`);
                });

            return {
                backupFileName,
                message: 'Backup is successful.',
            };
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }
}

module.exports = SystemService;