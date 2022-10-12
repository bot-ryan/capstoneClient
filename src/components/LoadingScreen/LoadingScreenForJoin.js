import axios from 'axios';
import React, {useState, useEffect} from 'react';
import './LoadingScreenForJoin.css'
import { useNavigate, useLocation, useParams} from 'react-router-dom'
import { Grid, Button } from '@mui/material';
import BackBtn from '@mui/material/Button';
import UndoIcon from '@mui/icons-material/Undo';
import CircularProgress from '@mui/material/CircularProgress';
import {SERVER, HOME_SCREEN} from '../../constants/routes'
import audio from './Audio/switch_007.ogg';
import { addRound } from '../Functions/GameFunctions';

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
  
    useEffect(() => {
      getGame();
    }, []);

    //Buttons
    const startOnClick = () => {
      console.log("startOnClick")
      addRound(gameID).then(game => {
        navigate(`/${gameID}/${playerID}/game`)
      })
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
  