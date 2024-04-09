let express = require('express')
let app = express()
app.use(express.json())
let path = require('path')
let sqlite3 = require('sqlite3')
let {open} = require('sqlite')
let path_file = path.join(__dirname, 'cricketTeam.db')

let db = null

let inilaizing_server = async () => {
  try {             
    db = await open({
      filename: path_file,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running on the port 3000')
    })
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

inilaizing_server()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  let query = `
    SELECT 
    *
    FROM 
    cricket_team
    `
  let playersArray = await db.all(query)

  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  let player_detailes = request.body

  let {playerName, jerseyNumber, role} = player_detailes

  let post_query = `
        INSERT INTO 
        cricket_team (player_name, jersey_number, role)
       values('${playerName}',
       ${jerseyNumber},
       '${role}')
  `
  let dbResponse = await db.run(post_query)
  const bookId = dbResponse.lastID

  response.send('Player Added to Team')

  //response.send({bookId: bookId})
})

app.get('/players/:playerId/', async (request, response) => {
  let {playerId} = request.params
  let get_query = `
SELECT 
*
FROM 
cricket_team
WHERE 
player_id =${playerId};`

  let playersArray = await db.all(get_query)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.put('/players/:playerId', async (request, response) => {
  let {playerId} = request.params
  let player_detailes = request.body
  let {playerName, jerseyNumber, role} = player_detailes
  let put_requery = `
  UPDATE 
  cricket_team
  set 
  player_name ='${playerName}',
  jersey_number=${jerseyNumber},

  role ='${role}'
  WHERE 
  player_id =${playerId};`

  await db.run(put_requery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId', async (request, response) => {
  let {playerId} = request.params
  let query_delete = `
  DELETE FROM
  cricket_team 
  WHERE 
  player_id =${playerId}`

  await db.run(query_delete)
  response.send('Player Removed')
})

module.exports = app
