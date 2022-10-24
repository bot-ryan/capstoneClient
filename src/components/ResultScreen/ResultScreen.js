import './ResultScreen.css';
import { useNavigate, useParams} from 'react-router-dom'
import { Grid, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { blue, deepOrange, green, purple } from '@mui/material/colors';
import { style } from '@mui/system';
import ButtonGroup from '@mui/material/ButtonGroup';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { HOME_SCREEN } from '../../constants/routes';
import audio from './Audio/switch_007.ogg';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {SERVER} from '../../constants/routes';

function ResultScreen() {
  let navigate = useNavigate();

  const client = axios.create({baseURL: `${SERVER}`});
  const {gameID, playerID} = useParams();
  const [game, setGame] = useState(null);
  const [player, setPlayer] = useState(null);
  const [leaderboards, setLeaderboards] = useState(null);
  const [sortedLeaderboards, setSortedLeaderboards] = useState(null);

  //useEffects
  useEffect(() => {
    console.log("initial getGame")
    getGame();
    console.log("initial getPlayer")
    getPlayer();
    console.log("initial leaderboard")
    getLeaderboards();
  },[])

  // useEffect(() => {
  //   getLeaderboards();
  // })

  useEffect(() => {
    var i, j, max_idx;
    var arr = leaderboards;
    console.log("leaderboards",leaderboards);
 
    for (i = 0; i < arr?.length-1; i++) {
        // Find the max score
        max_idx = i;
        for (j = i + 1; j < arr?.length; j++){
          if (arr[j]?.score > arr[max_idx]?.score) {
              max_idx = j;
          }
          swap(arr,max_idx, i);
        }
    }

    setSortedLeaderboards(arr)
  }, [leaderboards])

  const swap = (arr,a, b) => {
    var temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
  }

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

  //Player API
  const getPlayer = () => (
    client.get(`/player/${playerID}`)
    .then(res => {
      console.log("getPlayer",res)
      setPlayer(res?.data)
    })
    .catch(function (error) {
        console.log(error);
    })
  )

  //Leaderboard API
  const getLeaderboards = () => (
    client.get(`/leaderboard`)
    .then(res => {
      console.log("getLeaderboard",res)
      var arr = res?.data;      
      setLeaderboards(arr?.filter(filterGame))
    })
    .catch(function (error) {
        console.log(error);
    })
  )

  const filterGame = (player) => {
    return player?.gameID === gameID;
  }
  
  const playSound = () =>{
    new Audio(audio).play();
  }

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  function createData(ranking, color, name, capital) {
    return {ranking, color, name, capital};
  }

  const rows = [
    createData(1,<Avatar sx={{ bgcolor: deepOrange[500] }} variant="square"></Avatar>, 'Oil Corps', '$10000000'),
    createData(2, <Avatar sx={{ bgcolor: green[500] }} variant="square"></Avatar>, 'Monopoily', '$8500000'),
    createData(3, <Avatar sx={{ bgcolor: purple[500] }} variant="square"></Avatar>, 'Bruh', '$7000000'),
  ];

  return (    
    <Grid className="result-box">
      <Grid
        container
        spacing={0}
        direction="row"
        justifyContent="space-evenly"
        alignItems="center"
      >
        <Grid item xs={12}>
          <span className="GameName" onClick={() => navigate(`${HOME_SCREEN}`)}>Oil Corps</span>
        </Grid>
        <Grid item xs={12}>
          <span className="GameResult">Game Result: </span>
        </Grid>
        <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Ranking</StyledTableCell>
            <StyledTableCell align="left">Company Name</StyledTableCell>
            <StyledTableCell align="left">Capital</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedLeaderboards?.map((row, idx) => (
            <StyledTableRow>
              <StyledTableCell align="left"><span className="ResultData">{idx+1}</span></StyledTableCell>
              <StyledTableCell align="left"><span className="ResultData">{row?.name}</span></StyledTableCell>
              <StyledTableCell align="left"><span className="ResultData">${row?.score} Mil.</span></StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
        <Grid item xs={12}justifyContent="center" style={{display: "flex"}}>
            <Grid className='statement' direction="row" item xs={5} container spacing={1} justifyContent="flex-start" alignItems="flex-start">
                    <Grid item xs= {12} justifyContent="center" style={{display: "flex"}} >
                         <span className="CompanyResultName Ital">{player?.name} Financial Statement</span>
                    </Grid>
                    <Grid item xs= {12} style={{display: "flex", marginLeft:"20px"}} >
                        <span className="ResultData">Initial Capital: $200 Million</span>
                    </Grid>
                    <Grid item xs= {12} style={{display: "flex", marginLeft:"20px"}} >
                        <span className="ResultData">Final Capital: ${player?.capital} Million</span>
                    </Grid>
                    <Grid item xs= {12} style={{display: "flex", marginLeft:"20px"}} >
                        <span className="ResultData">Revenue: ${player?.capital-20} Million</span>
                    </Grid>
              </Grid>
        </Grid>
          
          <ButtonGroup variant="variant" size="large">
            <Button onClick={() => {navigate("/"); playSound();}}>Back To Home Screen</Button>
            <Button onClick={() => {navigate(`/${gameID}/${playerID}/leaderboard`); playSound();}}>Leaderboard</Button>
          </ButtonGroup>
      </Grid>
    </Grid>
  );
}

export default ResultScreen;

