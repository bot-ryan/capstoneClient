import './LeaderBoard.css';
import '../ResultScreen/ResultScreen.css';
import { useNavigate} from 'react-router-dom'
import { Grid } from '@mui/material';
import BackBtn from '@mui/material/Button';
import UndoIcon from '@mui/icons-material/Undo';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { SERVER, HOME_SCREEN } from '../../constants/routes';
import audio from './Audio/switch_007.ogg';
import { useEffect, useState } from 'react';
import axios from 'axios';

function LeaderBoard() {
    let navigate = useNavigate();
    const client = axios.create({baseURL: `${SERVER}`});
    const [leaderboards, setLeaderboards] = useState(null);
    const [sortedLeaderboards, setSortedLeaderboards] = useState(null);

    //useEffects
    useEffect(() => {
      console.log("initial leaderboard")
      getLeaderboards();
    },[])

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
      console.log("sortedleaderboards",arr);
      setSortedLeaderboards(arr)
    }, [leaderboards])

    useEffect(() => {
      leaderboardUI();
    },[sortedLeaderboards])

    const swap = (arr,a, b) => {
      var temp = arr[a];
      arr[a] = arr[b];
      arr[b] = temp;
    }

    //Leaderboard API
    const getLeaderboards = () => (
      client.get(`/leaderboard`)
      .then(res => {
        console.log("getLeaderboard",res)
        setLeaderboards(res?.data)
      })
      .catch(function (error) {
          console.log(error);
      })
    )

    //UI
    const leaderboardUI = () => {
      return(
        <>
          <TableBody>
            {sortedLeaderboards?.map((row, idx) => (
              <StyledTableRow>
                <StyledTableCell align="left"><span className="ResultData">{idx+1}</span></StyledTableCell>
                <StyledTableCell align="left"><span className="ResultData">{row?.name}</span></StyledTableCell>
                <StyledTableCell align="left"><span className="ResultData">${row?.score} Mil.</span></StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </>
      )
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
  
    function createData(ranking, name, capital) {
      return {ranking, name, capital};
    }
  
    const rows = [
      createData(1, 'Oil Corps', '$10000000'),
      createData(2, 'Monopoily', '$8500000'),
      createData(3, 'Bruh', '$7000000'),
      createData(4, 'Company 1', '$5000000'),
      createData(5, 'Company 2', '$4500000'),
      createData(6, 'Company 3', '$3000000'),
    ];
  
  
    return (    
      <Grid className="Screen-box">
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
            <span className = 'GameResult'>Hall Of Fame </span>
          </Grid>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell><span className="ResultData">Ranking</span></StyledTableCell>
                  <StyledTableCell align="left"><span className="ResultData">Company</span></StyledTableCell>
                  <StyledTableCell align="left"><span className="ResultData">Capital</span></StyledTableCell>
                </TableRow>
              </TableHead>
              {/* <TableBody>
                {sortedLeaderboards?.map((row, idx) => (
                  <StyledTableRow>
                    <StyledTableCell align="left"><span className="ResultData">{idx+1}</span></StyledTableCell>
                    <StyledTableCell align="left"><span className="ResultData">{row?.name}</span></StyledTableCell>
                    <StyledTableCell align="left"><span className="ResultData">${row?.score} Mil.</span></StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody> */}
              {leaderboardUI()}
            </Table>
          </TableContainer>
          
          <Grid item xs={12}>
            <BackBtn
              variant='text'
              size="medium"
              startIcon={<UndoIcon/>}
              onClick={() => {navigate("/"); playSound();}}
              style={{cursor:'pointer'}}
            >
              Back To Home Screen
            </BackBtn>
          </Grid>
        </Grid>
      </Grid>
    );
  }
  
  export default LeaderBoard;
  