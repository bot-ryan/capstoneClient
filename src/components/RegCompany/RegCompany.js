import './RegCompany.css';
import { useNavigate, useLocation, useParams} from 'react-router-dom'
import {Grid, Button} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import UndoIcon from '@mui/icons-material/Undo';
import BackBtn from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import { SERVER, HOME_SCREEN, JOIN_LOBBY } from '../../constants/routes';
import * as Colour from '../../constants/colours';
import audio from './Audio/switch_007.ogg';
import axios from 'axios';

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
    capital: 200,
    score: 0
  })

  //Player API    
  const createPlayer = () => (
    client.post(`/player/create`,{
      name: player?.name,
      capital: player?.capital,
      score: 0,
      colour: getColour(),
      host: host
    })
    .then(res => {
      updateGamePlayers(res?.data)
      return res;
    })
    .then(res => {
      if(host) {
        updateHost(res?.data?._id)
      }
      return res;
    })
    .then(res => {
      navigate(`/${gameID}/${res?.data?._id}/loading`, {state: {host: host}})
    })
    .catch(function (error) {
        console.log(error);
    })
  );

  const getPlayer = () => (
    client.get(`/player/${playerID}`)
    .then(res => {
      setPlayer(res?.data)
    })
    .catch(function (error) {
        console.log(error);
    })
  )
  
  const updatePlayer = () => (
    client.put(`/player/${playerID}`,{
      name: player?.name,
      capital: player?.capital,
      score: player?.score
    })
    .then(res => {
      setPlayer(res?.data)
      navigate(`/${gameID}/${res?.data?._id}/loading`, {state: {host: host}})
    })
    .catch(function (error) {
        console.log(error);
    })
  );

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
    
  // const updateGamePlayers = (player) => (
  //   console.log("UpdateGamePlayers", player,game?.players),
  //   client.patch(`/game/${gameID}`,{
  //     // players: game?.players?.push({
  //     //   _id: player?._id,
  //     //   name: player?.name,
  //     //   capital: player?.capital,
  //     //   score: player?.score,
  //     //   concessions: player?.concessions,
  //     //   colour: player?.colour,
  //     //   host: player?. host
  //     // }),
  //     players:[...game?.players,player]
  //   })
  //   .then(res => {
  //     console.log("UpdateGamePlayers res",res)
  //   })
  //   .catch(function (error) {
  //       console.log(error);
  //   })
  // );
    
  const updateGamePlayers = (player) => (
    console.log("UpdateGamePlayers", player,game?.players),
    client.patch(`/game/${gameID}/${player?._id}`)
    .then(res => {
      console.log("UpdateGamePlayers res",res)
    })
    .catch(function (error) {
        console.log(error);
    })
  );
    
  const updateHost = (id) => (
    client.patch(`/game/${gameID}`,{
      gamePin: game?.gamePin,
      round: game?.round,
      host: id
    })
    .then(res => {
      console.log("UpdateHost")
    })
    .catch(function (error) {
        console.log(error);
    })
  );

  useEffect(() => {
    getGame();
  }, []);

  const getColour = () => {
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
  }

  const handleReady = () =>{
    playSound();
    if(playerID == null) {   
      createPlayer();
    }
    else {
      updatePlayer();
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
