const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;



function createWindow () {

    mainWindow = new BrowserWindow({width: 640, height: 480,
        minWidth: 640, minHeight: 480}); // on définit une taille pour notre fenêtre
        mainWindow.maximize();
        mainWindow.loadURL(`file://${__dirname}/index.html`); // on doit charger un chemin absolu

        //const childWindow = new BrowserWindow({parent: mainWindow});

        mainWindow.on('closed', () => {
            mainWindow = null;
        });

        mainWindow.$ = mainWindow.jQuery = require('jquery');
    }

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow)

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow()
        }
    })
