import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomeScreen from './components/HomeScreen/HomeScreen';
import JoinLobby from './components/JoinLobby/JoinLobby';
import LoadingScreenForJoin from './components/LoadingScreen/LoadingScreenForJoin';
import RegCompany from './components/RegCompany/RegCompany';
import ErrorScreen from './components/ErrorScreen/ErrorScreen';
import MainScreen from './components/MainScreen/MainScreen';
import ResultScreen from './components/ResultScreen/ResultScreen';
import LeaderBoard from './components/LeaderBoard/LeaderBoard';
import { render } from '@testing-library/react';
import React, { useState } from 'react';
import { Grid, Button } from '@mui/material';
import {
  HOME_SCREEN,
  JOIN_LOBBY,
  REG_COMPANY,
  REG_COMPANY_BACK,
  LOADING_SCREEN,
  MAIN_SCREEN,
  ERROR_SCREEN,
  RESULT_SCREEN,
  LEADERBOARD_SCREEN
} from './constants/routes';

const handleClick = () =>{
  console.log("Hello");
}

function useWindowSize(){
  const [size, setSize] = useState([window.innerHeight, window.innerWidth]);
  return size;
}

function App(handleSongLoading,
  handleSongPlaying,
  handleSongFinishedPlaying) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="App">
      <Router>
        {/* <Sound
          url={bgm}
          playStatus = {isPlaying ? Sound.status.PLAYING : Sound.status.STOPPED}
          playFromPosition={300}
          onLoading={handleSongLoading}
          onPlaying={handleSongPlaying}
          onFinishedPlaying={handleSongFinishedPlaying}
          volume = {30}
        /> */}
        
          <Grid container>
            <Grid item xs={12} className="MainContent">
              <Routes>      
                <Route path = {HOME_SCREEN} element={<HomeScreen />} />
                <Route path = {JOIN_LOBBY} element={<JoinLobby />} />
                <Route path = {REG_COMPANY} element={<RegCompany />} />
                <Route path = {REG_COMPANY_BACK} element={<RegCompany />} />
                <Route path = {LOADING_SCREEN} element={<LoadingScreenForJoin />} />
                <Route path = {MAIN_SCREEN} element={<MainScreen />} />
                <Route path = {ERROR_SCREEN} element={<ErrorScreen />} />
                <Route path = {RESULT_SCREEN} element={<ResultScreen />} />
                <Route path = {LEADERBOARD_SCREEN} element={<LeaderBoard />} />
              </Routes>
            </Grid>
            <Grid item xs={12} 
              sx={{
                display:"flex",
                justifyContent:"flex-start"
              }}
            >
              {/*<Button onClick={()=> setIsPlaying(!isPlaying)}>{!isPlaying ? 'Play music' : 'Stop music'}</Button>*/}
            </Grid>
          </Grid>
      </Router>
    </div>
  );
}

export default App;

