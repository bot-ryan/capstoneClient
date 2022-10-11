import axios from 'axios';
import React, {useState, useEffect} from 'react';
import './LoadingScreenForJoin.css'
import { useNavigate, useLocation, useParams} from 'react-router-dom'
import { Grid, Button } from '@mui/material';
import BackBtn from '@mui/material/Button';
import UndoIcon from '@mui/icons-material/Undo';
import CircularProgress from '@mui/material/CircularProgress';
import {SERVER, HOME_SCREEN} from '../../constants/routes'
import {UNOWNED} from '../../constants/concessionStates';
import audio from './Audio/switch_007.ogg';

function LoadingScreenForJoin() {
    let navigate = useNavigate();
    let location = useLocation();

    const playSound = () =>{
      new Audio(audio).play();
    }

    const client = axios.create({baseURL: `${SERVER}`});
    const host = location?.state?.host;
    const {gameID, playerID} = useParams();
    const [game, setGame] = useState(null);
    const [concessions, setConcessions] = useState(null);
    const [concession, setConcession] = useState(null);
    const [concessionOwner, setConcessionOwner] = useState(null);

    //Game API
    const getGame = () => {
      try{
        client.get(`/game/${gameID}`)
        .then(res => {
          console.log("getGame",res)
          setGame(res?.data)
        })
        .catch(function (error) {
            console.log(error);
        })
      } catch(e) {
        console.log(e);
      }
    };

    //Concession API
    const getAllConcessions = () => {
      try{
        client.get(`/concession`)
        .then(res => {
          console.log("getAllConcessions",res)
          var arr = [];
          res.data.map(v => {
            arr = [...arr, v]
          })
          setConcessions(arr)
        })
        .catch(function (error) {
            console.log(error);
        })
      } catch(e) {
        console.log(e);
      }
    };
  
    const updateConcession = (id, newStat) => {
      try{
        client.put(`concession/${id}`,{
          location: concession?.location,
          cost: concession?.cost,
          resource: concession?.resource,
          status: `${newStat}`
        }).then(res => {
          console.log("updateConcession", res)
          getAllConcessions()
        })
        .catch(function (error) {
            console.log(error);
        })
      } catch(error) {
        console.log(error);
      }
    }

    const resetConcessions = () => {
      return new Promise((resolve, reject) => {
        console.log("reset",concessions)
        setTimeout(() => {
          resolve(
            concessions.map((v) => {
              if(v?.status != UNOWNED){
                resetConcession(v);
              };
            })
          );
        }, 300);
      }).then(() => {
        navigate(`/${gameID}/${playerID}/game`)
      })
    }

  const resetConcession = (conc) => {
    try{
      client.put(`concession/${conc?._id}`,{
        location: conc?.location,
        cost: conc?.cost,
        resource: conc?.resource,
        status: UNOWNED,
        owner: ""
      }).then(res => {
        setConcessionOwner("");
        return res;
      }).then(res => {
        console.log("resetConcession", res)
        getAllConcessions()
      })
      .catch(function (error) {
          console.log(error);
      })
    } catch(error) {
      console.log(error);
    }
  }
  
    useEffect(() => {
      getGame();
      getAllConcessions();
    }, []);

    //Buttons
    const startOnClick = () => {
      console.log("startOnClick")
      resetConcessions();
    }

    //GUI
    function action(cell){
      //cell is the string of the cell name in map
      //OnClick: Change the cell from unstudied to studied
      document.getElementById(cell).src=require("../MainScreen/images/" + cell + "S.png");
    }
    
    return (
    <Grid className="Screen-box">
      <Grid
        container
        spacing={1}
        direction="row"
        justifyContent="space-evenly"
        alignItems="center"
      >
        <Grid item xs={12}>
          <span className="GameName" onClick={() => navigate(`${HOME_SCREEN}`)}>Oil Corps</span>
          <br/>
          <span className="GamePin">Game Pin: {game?.gamePin}</span>
        </Grid>
        <Grid item xs={12}>
          <span>Please wait for the host to start the game...</span>
        </Grid>
        <Grid item xs={12}>
          <CircularProgress />
        </Grid>
        <Grid item xs={12}>
          <span className='tips'>Tips: While waiting, feel free to rename your company by click 'BACK' button.</span>
        </Grid>
        <Grid item xs={6} alignItems='right'>
          <BackBtn
            variant='text'
            size="medium"
            startIcon={<UndoIcon/>}
            onClick={() => {navigate(`/${gameID}/${playerID}/createCompany`, {state: {host : host}}); playSound()}}
            style={{cursor:'pointer'}}
          >
            Back
          </BackBtn>
        </Grid>
        <Grid item xs={6}>
          {host?
            <Button
              variant='contained'
              color="success"
              size="large"
              onClick={() => {startOnClick()}}
              atyle={{cursor:'pointer'}}
            >
              Start Game
            </Button>
            :
            null
          }
        </Grid>
      </Grid>
    </Grid>
    );
  }
  
  export default LoadingScreenForJoin;
  