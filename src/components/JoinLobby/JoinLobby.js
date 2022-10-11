import './JoinLobby.css';
import { useNavigate, useLocation } from 'react-router-dom'
import { Dialog, DialogActions, DialogContent, DialogContentText, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import BackBtn from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import UndoIcon from '@mui/icons-material/Undo';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { SERVER, HOME_SCREEN } from '../../constants/routes';

function JoinLobby() {
  let navigate = useNavigate();
  const client = axios.create({baseURL: `${SERVER}`});
  const [pin, setPin] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const descriptionElementRef = React.useRef(null);

  //Game Data API
  const getGameByGamePin = () => {
    try{
      client.get(`/game`)
      .then(res => {
        console.log("getAllGames",res)
        res?.data?.map((v) => {
          if(v?.gamePin == pin) {
            navigate(`/${v?._id}/createCompany`, {state: {host: false}})
          }
          setDialogOpen(true)
        })
      })
      .catch(function (error) {
          console.log(error)
      })
    } catch(e) {
      console.log(e);
    }
  };

  //Buttons
  const confirmOnClick = () => {
    getGameByGamePin();
  }

  //Dialog box
  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  useEffect(() => {
    console.log("dialogopen effect",dialogOpen)
    if (dialogOpen) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [dialogOpen]);

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
            <span className="GameName" onClick={() => navigate(`${HOME_SCREEN}`)}>Oil Corps</span>
          </Grid>
          <Grid item xs={12}>
            <span>Please enter a pin for the lobby: </span>
          </Grid>
          <Grid item xs={12}>
            <input
              type="text"
              placeholder='Game Pin'
              className='pin'
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            ></input>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant='contained'
              color="success"
              size="large"
              startIcon={<CheckIcon/>}
              onClick={() => confirmOnClick()}
              atyle={{cursor:'pointer'}}
            >
              Confirm
            </Button>
          </Grid>
          <Grid item xs={12}>
            <BackBtn
              variant='text'
              size="medium"
              startIcon={<UndoIcon/>}
              onClick={() => {navigate(`${HOME_SCREEN}`)}}
              style={{cursor:'pointer'}}
            >
              Back
            </BackBtn>
          </Grid>
        </Grid>
      </Grid>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        <DialogContent>
          <DialogContentText
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            Lobby not found! Please try again.
          </DialogContentText>                        
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default JoinLobby;
