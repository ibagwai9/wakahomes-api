const cloudinary = require('cloudinary-react')

cloudinary.config({
    cloud_name:"drxkp1erj",
    api_key:"218187136849528",
    api_secret:"dF879L426Z38DnkBvSKuG_IcSCo"
})
exports.upload =(file)=>{
    return new Promise((resolve)=>{
        cloudinary.uploader.upload(
            file,
            (result)=>{
                resolve({url:result.url,id:result.id})
            },
            { resource_type: 'auto'}
        )
    })
}
module.exports={cloudinary}