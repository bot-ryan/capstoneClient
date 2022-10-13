import { ConnectingAirportsOutlined } from '@mui/icons-material';
import axios from 'axios';
import * as ConcState from '../../constants/concessionStates';
import * as Routes from '../../constants/routes';
import { getPlayer, updatePlayerConcessions } from './PlayerFunctions';

const client = axios.create({baseURL: `${Routes?.SERVER}`});

//Concessions API
export const getAllConcessions = async() => {
  try{
    const req = await client.get(`/concession`)
    const data = await req?.data;
    return data;
  } catch(e) {
    console.log(e);
  }
};

export const getConcession = async(id) => {
  try{
    const req = await client.get(`/concession/${id}`).catch(function (error) {
      console.log(error);
    })
    const data = await req?.data;
    return data;
  } catch(e) {
    console.log(e);
  }
}

export const updateConcessionStatus = async(concession, status, playerID) => {
  try{
    const req = await client.put(`concession/${concession?._id}`,{
      location: concession?.location,
      cost: concession?.cost,
      resource: concession?.resource,
      status: status,
      owner: playerID
    }).catch(function (error) {
      console.log(error);
    });
    const data = await req?.data;
    console.log("updateConcessionStatus",data);
    return data;
  } catch(e) {
    console.log(e);
  }
}

export const resetConcession = async(conc) => {
  try{
    const req = await client.put(`concession/${conc?._id}`,{
      location: conc?.location,
      cost: randValue(conc?.cost,5),
      resource: randValue(conc?.resource,10),
      status: ConcState.UNOWNED,
      owner: ""
    }).catch(function (error) {
      console.log(error);
    })
    const data = await req?.data;
    return data;
  } catch(error) {
    console.log(error);
  };
}

export const buyConcession = async(id, playerID) => {
  try{      
    const res = await getAllConcessions().then(concessions => {
      const conc = concessions?.find(c => c?._id == id);
      if(conc?.status === ConcState.UNOWNED) {
        return updateConcessionStatus(conc, ConcState.OWNED, playerID).then(res => {
          return updatePlayerConcessions(id, playerID).then(res => {
            return getConcession(id).then(res => {
              console.log("buyConc", res);
              return res;
            })
          })
        })
        .catch(function (error) {
          console.log(error);
        })
      }
      else {
        alert("Concession owned")
      }
    })
    .catch(function (error) {
        console.log(error);
    })

    return res;
  } catch(error) {
    console.log(error);
  }
}

//FUNCTIONS
export const resetGame = () => {
  console.log("resetGame")
  getAllConcessions().then((concessions) => {  
    //Reset Concessions
    concessions?.map((v) => {
      resetConcession(v);
    })
  })
}

export const randValue = (base, upperBound) => {
  if(base > 0) {
    return Math.floor((Math.random()*upperBound)+1) * 1000;
  }
  else {
    return 0;
  }
}

export const getNoOwnedLand = async(playerID) => {
  var count = 0;
  getPlayer(playerID).then(player => {
    player?.concessions.map((v) => {
      getConcession(v).then(conc => {
        if(conc?.status == ConcState.OWNED) {
          count++;
        }
      })
      return count;
    })
  });

  return count;
};