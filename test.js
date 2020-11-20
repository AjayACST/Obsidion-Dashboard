const {Pool} = require('pg');

const pool = new Pool({
    user: 'discord',
    host: '172.21.217.127',
    database: 'discord',
    password: 'hunter12',
    port: 5432
})

pool.query('SELECT username FROM discord_user WHERE id=267452404528709632', (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      if (!res.rows[0]){
        console.log("yay")
      } else {
        console.log('test')
      }
    }
  })

// client.query('SELECT username FROM discord_user WHERE id=267452404528709632', (err, res) => {
//     if (err) {
//       console.log(err.stack)
//     } else {
//       console.log(res.rows[0])
//     }
//   })

// client.query(`SELECT username FROM discord_user WHERE id=267452404528709632`).then(response => console.log(response.rows[0])).catch(e => console.error(e.stack))