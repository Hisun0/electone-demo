import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import connectDB from './db';

async function getPartners() {
  try {
    const response = await global.dbclient.query(
      `
      SELECT
        u.user_id,
        u.full_name,
        u.birthday,
        uj.position,
        uj.organization,
        uj.salary
      FROM
        public.users u
      LEFT JOIN public.users_job uj ON
        uj.user_id = u.user_id;
      `
    )
    return response.rows
  } catch (e) {
    console.log(e)
    dialog.showErrorBox('Error', 'database error')
  }
}

async function createPartner(userData) {
  try {
    await global.dbclient.query('BEGIN')

    const userRes = await global.dbclient.query(
      'INSERT INTO users (full_name, birthday) VALUES ($1, $2) RETURNING user_id',
      [userData.full_name, userData.birthday]
    )
    const userId = userRes.rows[0].user_id

    await global.dbclient.query(
      'INSERT INTO users_job (user_id, position, organization, salary, start_date) VALUES ($1, $2, $3, $4, $5)',
      [userId, userData.position, userData.organization, userData.salary, userData.start_date]
    )

    await global.dbclient.query('COMMIT')
  } catch (e) {
    await global.dbclient.query('ROLLBACK')
    console.log(e)
    dialog.showErrorBox('Error', 'database error')
  }
}

async function updatePartner(userData) {
  try {
    await global.dbclient.query('BEGIN')

    const userRes = await global.dbclient.query(
      `UPDATE users
             SET full_name = COALESCE($1, full_name),
                 birthday = COALESCE($2, birthday)
             WHERE user_id = $3 RETURNING user_id`,
      [userData.full_name, userData.birthday, userData.user_id]
    )

    if (userRes.rowCount === 0) {
      throw new Error("Пользователь не найден")
    }

    await global.dbclient.query(
      `UPDATE users_job
             SET position = COALESCE($1, position),
                 organization = COALESCE($2, organization),
                 salary = COALESCE($3, salary),
                 start_date = COALESCE($4, start_date)
             WHERE user_id = $5`,
      [userData.position, userData.organization, userData.salary, userData.start_date, userData.user_id]
    )

    await global.dbclient.query('COMMIT')

    await dialog.showMessageBox({message: 'Успех! Пользователь создан'})
    return { success: true }
  } catch (error) {
    await global.dbclient.query('ROLLBACK')
    console.log(error)
    dialog.showErrorBox('Error', 'database error')
  }
}

async function getExpenses() {
  try {
    const result = await global.dbclient.query(
      `
      SELECT u.user_id, sum(p.price * e.amount) AS total_expense, uj.salary FROM expenses e
      INNER JOIN users u ON u.user_id = e.user_id
      INNER JOIN users_job uj ON uj.user_id = u.user_id
      INNER JOIN products p ON e.product_id = p.product_id
      GROUP BY u.user_id, uj.salary;
      `
    )

    return result.rows
  } catch (e) {
    console.log(e)
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: join(__dirname, '../../resources/icon.ico'),
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  global.dbclient = await connectDB();

  ipcMain.handle('getPartners', getPartners)
  ipcMain.handle('getExpenses', getExpenses)
  ipcMain.handle('createPartner', async (event, userData) => {
    return await createPartner(userData);
  })
  ipcMain.handle('updatePartner', async (event, userData) => {
    return await updatePartner(userData);
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
