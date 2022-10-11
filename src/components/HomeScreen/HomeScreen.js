import './HomeScreen.css';
import { useNavigate} from 'react-router-dom'
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/Create';
import GroupsIcon from '@mui/icons-material/Groups';
import {
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import audio from './Audio/switch_007.ogg';
import axios from 'axios';
import { SERVER,JOIN_LOBBY,HOME_SCREEN } from '../../constants/routes';
import { resetGame } from '../Functions/GameFunctions';

function HomeScreen() {

  let navigate = useNavigate();
  const client = axios.create({baseURL: `${SERVER}`});
    
  const createGame = () => (
    client.post(`/game/create`,{
      gamePin: createGamePin(),
      round: 1,
      maxRounds: 20,
      players: [],
      host: '-'
    })
    .then(res => {
      resetGame()
      return res;
    })
    .then(res => {
      navigate(`/${res?.data?._id}/createCompany`, {state: {host: true}})  
    })
    .catch(function (error) {
        console.log(error);
    })
  );
  
  const createGamePin = () => {
    var pin = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (var ii = 0; ii < 6; ii++ ) {
      pin += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
   return pin;
  };
  
  const createLobbyOnClick = () =>{
    playSound();
    createGame();
  }

  const playSound = () =>{
    new Audio(audio).play();
  }

  //Help dialog function
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [helpScroll, setHelpScroll] = React.useState('paper');
  const handleHelpClickOpen = (scrollType) => () => {
    playSound();
    setHelpOpen(true);
    setHelpScroll(scrollType);
  };
  const handleHelpClose = () => {
    setHelpOpen(false);
  };
  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (helpOpen) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [helpOpen]);

  //About dialog function
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [aboutScroll, setAboutScroll] = React.useState('paper');
  const handleAboutClickOpen = (scrollType) => () => {
    playSound();
    setAboutOpen(true);
    setAboutScroll(scrollType);
  };
  const handleAboutClose = () => {
    setAboutOpen(false);
  };
  const descriptionElementRef2 = React.useRef(null);
  React.useEffect(() => {
    if (aboutOpen) {
      const { current: descriptionElement2 } = descriptionElementRef2;
      if (descriptionElement2 !== null) {
        descriptionElement2.focus();
      }
    }
  }, [aboutOpen]);

  //Send error report
  const [reportOpen, setReportOpen] = React.useState(false);
  const handleReportClickOpen = () => {
    setReportOpen(true);
  };
  const handleReportClose = () => {
    setReportOpen(false);
  };

  //Notification of report sent dialog function
  const [reportSentOpen, setReportSentOpen] = React.useState(false);
  const handleReportSentClickOpen = () => {
    setReportSentOpen(true);
  };
  const handleReportSentClose = () => {
    setReportSentOpen(false);
  };
  
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
        </Grid>
        <Grid item xs={12}>
          <Button
            variant='contained'
            color="success"
            size="large"
            startIcon={<CreateIcon/>}
            onClick={() => {
              createLobbyOnClick();
            }}
            style={{cursor:'pointer'}}
          >
            Create Lobby
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            border-radius='100px'
            variant='contained'
            color="warning"
            size="large"
            startIcon={<GroupsIcon/>}
            onClick={() => {navigate(`${JOIN_LOBBY}`); playSound()}}
            style={{cursor:'pointer'}}
          >
            Join Lobby
          </Button>
        </Grid>
        <Grid item xs={12}>
          <ButtonGroup sx={{ margin: 2 }} variant="text" aria-label="outlined button group" size="small">
                  {/* <Button  onClick={() => {playSound();}}>Settings</Button> */}
                  <Button onClick={handleHelpClickOpen('body')}>Help</Button>
                    <Dialog
                      open={helpOpen}
                      onClose={handleHelpClose}
                      scroll={helpScroll}
                      aria-labelledby="scroll-dialog-title"
                      aria-describedby="scroll-dialog-description"
                    >
                      <DialogTitle id="scroll-dialog-title">Oil Corps - Help Screen</DialogTitle>
                      <DialogContent dividers={helpScroll === 'paper'}>
                      <DialogContentText
                          ref={descriptionElementRef}
                          tabIndex={-1}
                        >
                          1. Is Oil Corps a turn-based game?<br/>
                          <Typography className='answer'>Oil Corps is a turn-based game, with every player has a single move or action to perform every round.</Typography><div id="just-line-break"></div><br/>
                        </DialogContentText>                        
                        <DialogContentText
                          ref={descriptionElementRef}
                          tabIndex={-1}
                        >
                          2. Players number for Oil Corps?<br/>
                          <Typography className='answer'>The maximum number of players is 4 players, and it is preferrable to have maximum number.</Typography><div id="just-line-break"></div><br/>
                        </DialogContentText> 
                        <DialogContentText
                          ref={descriptionElementRef}
                          tabIndex={-1}
                        >
                          3. What is the GPU requirement for Oil Corps?<br/>
                          <Typography className='answer'>A dedicated grapic card is not required in your system. However, it is important to know that an integrated graphic card is required to make output to the monitor.</Typography><div id="just-line-break"></div><br/>
                        </DialogContentText> 
                        <DialogContentText
                          ref={descriptionElementRef}
                          tabIndex={-1}
                        >
                          4. What is the control to play Oil Corps?<br/>
                          <Typography className='answer'>Mouse & keyboard for computer users, and touchscreen only for phone users.</Typography><div id="just-line-break"></div><br/>
                        </DialogContentText> 
                        <DialogContentText
                          ref={descriptionElementRef}
                          tabIndex={-1}
                        >
                          5. Can I still see my results after the game?<br/>
                          <Typography className='answer'>If your score is manage to reach the leaderboard, the leaderboard will be updated and your company will be displayed in the leaderboard.</Typography><div id="just-line-break"></div><br/>
                        </DialogContentText>
                        <DialogContentText
                          ref={descriptionElementRef}
                          tabIndex={-1}
                        >
                          6. Will my data be stored or shared?<br/>
                          <Typography className='answer'>No, we do not share user data. We will only store username and the result on the Leaderboard.</Typography><div id="just-line-break"></div><br/>
                        </DialogContentText>
                        <DialogContentText
                          ref={descriptionElementRef}
                          tabIndex={-1}
                        >
                          7. What happen if I quit game in the middle of the simulation?<br/>
                          <Typography className='answer'>You will be considered as forfeiting the game if you quit in the middle of the game.</Typography><div id="just-line-break"></div><br/>
                        </DialogContentText> 

                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleHelpClose}>Close</Button>
                        {/* <Button onClick={handleReportClickOpen}>Report Bug</Button>
                        <Dialog open={reportOpen} onClose={handleReportClose}>
                          <DialogTitle>Error Report</DialogTitle>
                          <DialogContent>
                            <DialogContentText>Please enter the error or bug detail(s) below:</DialogContentText>
                            <TextField
                              autoFocus
                              margin="dense"
                              id="details"
                              label="Details"
                              fullWidth variant="standard"
                              size='large'
                            />
                            <TextField
                            autoFocus
                            margin="dense"
                            id="email"
                            label="Your email address"
                            fullWidth variant="standard"
                            size='large'
                          />
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={handleReportClose}>Cancel</Button>
                            <Button onClick={handleReportSentClickOpen}>Submit</Button>
                              <Dialog
                                open={reportSentOpen}
                                onClose={handleReportSentClose}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                              >
                              <DialogTitle>
                                Error Report
                              </DialogTitle>
                              <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                  The report has been submitted! Thank you for reporting!
                                </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={handleReportSentClose}>Ok</Button>
                              </DialogActions>
                            </Dialog>
                            </DialogActions>
                        </Dialog>*/}
                      </DialogActions>
                    </Dialog>

                  <Button onClick={handleAboutClickOpen('body')}>About</Button>
                    <Dialog
                        open={aboutOpen}
                        onClose={handleAboutClose}
                        scroll={aboutScroll}
                        aria-labelledby="scroll-dialog-title"
                        aria-describedby="scroll-dialog-description"
                      >
                        <DialogTitle id="scroll-dialog-title">Oil Corps - About</DialogTitle>
                        <DialogContent dividers={aboutScroll === 'paper'}>
                        <DialogContentText
                            ref={descriptionElementRef}
                            tabIndex={-1}
                          >
                            WELCOME!<br/>
                            OIL CORPS IS DEVELOPED BY<br/><div id="just-line-break"></div><br/>
                            <Typography className='answer'>Ho Huan Yue,<br/> Mir Mohd Ahasanul Kabir,<br/> Ryan Kristoffer Calipusan,<br/> Vivian Loo Hui Wen</Typography><div id="just-line-break"></div><br/>
                            Year: 2022
                          </DialogContentText>                        
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleAboutClose}>Close</Button>
                        </DialogActions>
                      </Dialog>

                </ButtonGroup>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default HomeScreen;
