// this part is to be used to replace try/catch block
//but i dont understand. go to error handling folder or rewatch the video
//so im using try/catch for now
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}