const multer = require('multer')





const fs = require('fs')
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        const { uploadpath, postedby, problemid } = req.headers
        if (!fs.existsSync(`executors/submissions/${uploadpath}/${postedby}/${problemid}`)) {
            fs.mkdirSync(`executors/submissions/${uploadpath}/${postedby}/${problemid}`, { recursive: true });
        }
        return cb(null, `executors/submissions/${uploadpath}/${postedby}/${problemid}`)

    },
    filename: (req, res, cb) => {
        const { ext } = req.headers
        //req.postDir = `/ posts / ${postedby} / ${postid} / ${index}.jpg`
        cb(null, `ppp.${ext}`)
    }
})

const upload = multer({ storage })

module.exports = { upload };