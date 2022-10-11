import axios from 'axios';
import * as ConcState from '../../constants/concessionStates';
import * as Routes from '../../constants/routes';

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
    console.log("resetConcession req", req)    
    return data;
  } catch(error) {
    console.log(error);
  };
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