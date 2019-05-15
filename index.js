#!/usr/bin/env node

const { windows, android, linux, macos } = require('platform-detect')
const { spawn } = require('child_process')

function openDialog ({ prompt }) {
    return new Promise((resolve, reject) => {
        let script
        if (macos) {
            script = spawn('osascript', ['-e', `tell application (path to frontmost application as text)
            set myFile to choose file 
            POSIX path of myFile
            end`])
        }
        else if (windows) {
            script = spawn('powershell', [ '-c', `Function Get-FileName($initialDirectory)
            {   
             [System.Reflection.Assembly]::LoadWithPartialName(“System.windows.forms”) |
             Out-Null
            
             $OpenFileDialog = New-Object System.Windows.Forms.OpenFileDialog
             $OpenFileDialog.initialDirectory = $initialDirectory
             $OpenFileDialog.filter = “All files (*.*)| *.*”
             $OpenFileDialog.ShowDialog() | Out-Null
             $OpenFileDialog.filename
            }
            
            $file = Get-FileName # the variable contains user folder selection
            write-host $file.Trim()` ])
        }
        else if (linux || android) {
            throw new Error('linux not implemented')
        }

        const lines = []

        script.stdout.on('data', (line) => {
            if (line && line.toString().trim()) {
                lines.push(line.toString().trim())
            }
        })

        script.stderr.on('data', (line) => {
            reject(line)
        })

        script.on('close', (code) => {
            if (code === 0) resolve(lines)
            else reject(code)
        })
    })
    
}

module.exports = openDialog

if (require.main === module) {
    openDialog({}).then(files => {
        console.log(files)
    }).catch(err => {
        console.error(`${err}`)
    })
}