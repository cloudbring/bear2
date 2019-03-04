import app from './app'

const server = app.listen(app.get('port'), () =>{
    const name = app.get('name')
    const port = app.get('port')
    const env = app.get('env')
    console.log(
        `${name} is running on http://localhost:${port} in ${env} mode`
    )
})

export default server