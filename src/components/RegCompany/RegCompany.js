import './RegCompany.css';
import { useNavigate, useLocation, useParams} from 'react-router-dom'
import {Grid, Button} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import UndoIcon from '@mui/icons-material/Undo';
import BackBtn from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import { SERVER, HOME_SCREEN, JOIN_LOBBY } from '../../constants/routes';
import * as Colour from '../../constants/colours';
import * as Settings from '../../constants/gameSettings';
import audio from './Audio/switch_007.ogg';
import axios from 'axios';
import {
  createPlayer,
  updatePlayer,
  validatePlayerCreation,
  getPlayerColour
} from '../Functions/PlayerFunctions';
import {
  updateGamePlayers,
  updateHost
} from '../Functions/GameFunctions';
import { List } from 'react-bootstrap/lib/Media';

function RegCompany() {
  let navigate = useNavigate();
  let location = useLocation();
  
  const playSound = () =>{
    new Audio(audio).play();
  }

  const client = axios.create({baseURL: `${SERVER}`});
  const host = location?.state?.host;
  const {gameID, playerID} = useParams();
  const [game, setGame] = useState(null);
  
  const [player, setPlayer] = useState({
    name: "",
    capital: Settings.INITIAL_CAPITAL,
    score: 0,
    host: host,
    ready: true
  })

  //Player API
  const getPlayer = () => (
    client.get(`/player/${playerID}`)
    .then(res => {
      setPlayer(res?.data)
    })
    .catch(function (error) {
        console.log(error);
    })
  )

  useEffect(() => {
    if(playerID != null){
      getPlayer();
    };
  }, []);

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

  const handleReady = () =>{
    playSound();
    //create new player
    if(playerID == null) {
      validatePlayerCreation(gameID).then((validated) => {
        if(validated) {
          getPlayerColour(gameID).then((colour) => {
            createPlayer(player, colour).then(player => {
              const newPlayerID = player?._id;
              updateGamePlayers(newPlayerID,gameID).then(res => {
                updateHost(newPlayerID,gameID).then(res => {
                  navigate(`/${gameID}/${newPlayerID}/loading`, {state: {host: host}})
                })
              })
            });
          })
        }
        else {
          alert('Lobby is full.')
        }
      })
    }
    //update existing player
    else {
      updatePlayer(player).then((res) => {
        navigate(`/${gameID}/${playerID}/loading`, {state: {host: host}})
      })
    }
  }
  
  return (
    <>
      <Grid className="Screen-box">
        <Grid
          container
          spacing={1}
          direction="row"
          justifyContent="space-evenly"
          alignItems="center"
        >
          <Grid item xs={12}>
            <span className="GameName" onClick={() => {navigate(`${HOME_SCREEN}`); playSound();}}>Oil Corps</span>
            <br/>
            <span className="GamePin">Game Pin: {game?.gamePin}</span>
          </Grid>
          <Grid item xs={12}>
            <span>Please enter your company name: </span>
          </Grid>
          <Grid item xs={12}>
            <input
              type="text"
              placeholder='Company Name'
              value={player.name}
              onChange={(e) => setPlayer({...player, name: e.target.value})}
            ></input>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant='contained'
              color="success"
              size="large"
              startIcon={<HowToRegIcon/>}
              onClick={handleReady}
              style={{cursor:'pointer'}}
            >
              READY
            </Button>
          </Grid>
          <Grid item xs={12}>
            <BackBtn
              variant='text'
              size="medium"
              startIcon={<UndoIcon/>}
              onClick={() => host? (navigate(`${HOME_SCREEN}`) && playSound()) : (navigate(`${JOIN_LOBBY}`) && playSound())}
              style={{cursor:'pointer'}}
            >
              Back
            </BackBtn>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default RegCompany;
