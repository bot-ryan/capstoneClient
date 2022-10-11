import axios from 'axios';
import * as Routes from '../../constants/routes';

const client = axios.create({baseURL: `${Routes.SERVER}`});

//Game API
export const getGame = async(gameID) => {
    try{
      const req = await client.get(`/game/${gameID}`)
      .then(res => {
        console.log("getGame",res)
        return res;
      })
      .catch(function (error) {
          console.log(error);
      })
      console.log("getGame req",req);
      const data = await req?.data;
      return data;
    } catch(e) {
      console.log(e);
    };
  };
    
  export const updateGamePlayers = async(playerID, gameID) => {
    console.log("UpdateGamePlayers",playerID,gameID);
    const req = await client.patch(`/game/${gameID}/${playerID}`)
    .then(res => {
      console.log("UpdateGamePlayers res",res)
    })
    .catch(function (error) {
        console.log(error);
    });
    const data = req?.data;
    return data;
};
    
export const updateHost = async(playerID,gameID) => {
  const req = await client.patch(`/game/${gameID}`,{
    host: playerID
  })
  .then(res => {
    console.log("UpdateHost")
  })
  .catch(function (error) {
      console.log(error);
  });
  const data = await req?.data;
  return data;
};