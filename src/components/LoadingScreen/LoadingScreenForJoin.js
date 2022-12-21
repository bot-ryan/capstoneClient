import React, {useState, useEffect} from 'react';
import './LoadingScreenForJoin.css'
import { useNavigate, useLocation, useParams} from 'react-router-dom'
import { Grid, Button } from '@mui/material';
import BackBtn from '@mui/material/Button';
import UndoIcon from '@mui/icons-material/Undo';
import CircularProgress from '@mui/material/CircularProgress';
import {HOME_SCREEN} from '../../constants/routes'
import audio from './Audio/switch_007.ogg';
import {
  getGame,
  addRound
} from '../Functions/GameFunctions';
import {
  getPlayer
} from '../Functions/PlayerFunctions';

function LoadingScreenForJoin() {
    let navigate = useNavigate();
    let location = useLocation();

    const playSound = () =>{
      new Audio(audio).play();
    }

    const host = location?.state?.host;
    const {gameID, playerID} = useParams();
    const [game, setGame] = useState(null);
    const [players, setPlayers] = useState([]);
    const [playersText, setPlayersText] = useState("");
  
    useEffect(() => {
      getGame(gameID).then((g) =>{
        setGame(g);
      })
      waitStart();
    }, []);

    useEffect(()=>{
      console.log("game useEffect", game, players)
      //BUG: players array contains duplicates
      // if(game?.players?.length !== players?.length){
        game?.players?.map((p) =>{
          getPlayer(p).then((res)=>{
            if(!players.some(v => v._id === res?._id)){
              console.log("add Players", res)
              setPlayers(players => [...players,res]);
            }
          })
        })
      // }
    },[game]);

    //Show all players in waiting room
    useEffect(() => {
      let text = "";
      //remove duplicate players
      let uniquePlayers = players.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t._id === value._id
        ))
      )

      if(uniquePlayers?.length >= 1) {
        
        text = players[0]?.name;
        text.style.color = players[0]?.color;
      }
      for (let i = 1; i < uniquePlayers?.length; i++) {
        text += " | " + uniquePlayers[i]?.name;
      }

      setPlayersText(text);
    },[players])

    const waitStart = async() => {
      var start = false;
      while(!start){
        start = await getGame(gameID).then(g => {
          setGame(g);
          if(g?.round > 0) {
            return true;
          }
        })
      }
      playSound();
      navigate(`/${gameID}/${playerID}/game`, {state: {host: host}});
    }

    //Buttons
    const startOnClick = () => {
      playSound();
      addRound(gameID).then(game => {
        navigate(`/${gameID}/${playerID}/game`, {state: {host: host}})
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
          <span>{playersText}</span>
          <br/> <br/>
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
  