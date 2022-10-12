import axios from 'axios';
import * as Colour from '../../constants/colours';
import * as Routes from '../../constants/routes';
import * as Settings from '../../constants/gameSettings';
import { getGame } from './GameFunctions';

const client = axios.create({baseURL: `${Routes.SERVER}`});

//Player API
export const getPlayer = async(id) => {
  client.get(`/player/${id}`).catch(function (error) {
      console.log(error);
  })
}

export const createPlayer = async(player, colour) => {
    const req = await client.post(`/player/create`,{
      name: player?.name,
      capital: player?.capital,
      score: 0,
      colour: colour,
      host: player?.host
    })
    .catch(function (error) {
        console.log(error);
    });
    const data = await req?.data;
    return data;    
};
  
export const updatePlayer = async(player) => {
  const req = await client.patch(`/player/${player?._id}`,{
    name: player?.name,
    capital: player?.capital,
    score: player?.score
  })
  .catch(function (error) {
      console.log(error);
  })
  const data = await req?.data;
  return data;
};
    
export const updatePlayerConcessions = async(concessionID, id) => {
  console.log("updatePlayerConcessions",concessionID,id);
  const req = await client.patch(`/player/${id}/${concessionID}`)
  .then(res => {
    console.log("updatePlayerConcessions res",res)
  })
  .catch(function (error) {
      console.log(error);
  });
  const data = req?.data;
  return data;
};

export const validatePlayerCreation = async(gameID) => {
    const res = await getGame(gameID).then(game => {
        var valid = false;
        if(game?.players?.length < Settings?.MAX_PLAYERS && game?.round == 0) {
            valid = true;
        }
        return valid;
    })

    return res;
}

export const getPlayerColour = async(gameID) => {
    const res = await getGame(gameID).then(game => {
        var colour = Colour.BLUE;
        switch(game?.players?.length) {
          case 0:
            colour = Colour.ORANGE;
            break;
          case 1:
            colour = Colour.PURPLE;
            break;
          case 2:
            colour = Colour.GREEN;
            break;
          default:
            colour = Colour.BLUE;
        }
        return colour;
    })

    return res;
}