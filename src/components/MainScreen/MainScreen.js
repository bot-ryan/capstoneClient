import './MainScreen.css';
import { useNavigate, useLocation, useParams} from 'react-router-dom'
import Button from '@mui/material/Button';
import {
  Redo,
  AttachMoney,
  Science,
  Explore
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import { blue, deepOrange, green, purple } from '@mui/material/colors';
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
import GavelIcon from '@mui/icons-material/Gavel';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import audio from './Audio/switch_007.ogg';
import axios from 'axios';
import {SERVER} from '../../constants/routes';
import {UNOWNED,OWNED,EXPLORED,DEVELOPED} from '../../constants/concessionStates';
import * as Colour from '../../constants/colours';
import io from 'socket.io-client';

var socket;

function MainScreen() {
  let navigate = useNavigate();
  const location = useLocation();

  const playSound = () =>{
    new Audio(audio).play();
  }

  const {gameID, playerID} = useParams();
  const client = axios.create({baseURL: `${SERVER}`});

  const [concessions, setConcessions] = useState([]);  
  const [concession, setConcession] = useState(null);
  const [concessionOwner, setConcessionOwner] = useState(null);
  const [player, setPlayer] = useState(null);  
  const [players, setPlayers] = useState(null);  
  const [game, setGame] = useState(null);
  const [initial, setInitial] = useState(true);

  //Bidding dialog function
  const [bidOpen, setBidOpen] = React.useState(false);
  const handleBidClickOpen = () => {
    setBidOpen(true);
  };
  const handleBidClose = () => {
    setBidOpen(false);
  };
  
  //Bidding result dialog function
  const [BidResultOpen, setBidResultOpen] = React.useState(false);
  const handleBidResultClickOpen = () => {
    setBidResultOpen(true);
  };
  const handleBidResultClose = () => {
    setBidResultOpen(false);
  };

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
  
  //useEffect
  useEffect(() => {
    console.log("initial GetAllPlayer")
    getAllPlayers();

    console.log("initial GetAllConcession")
    getAllConcessions();
    
    console.log("initial GetPlayer")
    getPlayer(playerID);

    console.log("initial getGame")
    getGame();
  }, [])

  // useEffect(() => {
  //   socket = io(SERVER);
  // },[])

  useEffect(() => {
    console.log("Concession useeffect", concession)
    getOwnerName()
    if(concession != null && players != null) {
      getCellImage(concession);
    }
  }, [concession]);

  useEffect(() => {
    if(concessions != null && players != null && initial) {
      concessions.map((v) => {
        getCellImage(v);
      })
      setInitial(false);
    }
  }, [concessions, players]);

  useEffect(() => {
    console.log("ConcessionOwner useeffect", concessionOwner)
    concessionDetails()
  }, [concessionOwner]);

  useEffect(() => {
    console.log("PlayerDetails useeffect", player)
    playerDetails()
  }, [player]);

  useEffect(() => {
    if(concessions != null && players != null) {
        concessions.map((v) => {
          getCellImage(v);
      })
    }
  })

  //Concession API  
  const getAllConcessions = () => {
    try{
      client.get(`/concession`)
      .then(res => {
        console.log("getAllConcessions",res)
        var arr = [];
        res.data.map(v => {
          arr = [...arr, v];
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
        getConcessionByID(concession?._id);
        getAllConcessions()
      })
      .catch(function (error) {
          console.log(error);
      })
    } catch(error) {
      console.log(error);
    }
  }

  const buyConcession = (id) => {
    try{      
      client.get(`/concession`)
      .then(res => {
        console.log("getAllConcessions",res)
        var arr = [];
        res.data.map(v => {
          arr = [...arr, v];
        })
        setConcessions(arr)
      })
      .then(res => {
        if(concessions?.find(conc => conc?._id == id)?.status == UNOWNED) {
          client.put(`concession/${id}`,{
            location: concession?.location,
            cost: concession?.cost,
            resource: concession?.resource,
            status: OWNED,
            owner: playerID
          }).then(res => {
            console.log("updateConcession", res)
            getConcessionByID(concession?._id);
            getAllConcessions()
          })
          .catch(function (error) {
              console.log(error);
          })
        }
        else {
          console.log("Concession owned", concessions?.find(conc => conc?._id == id))
        }
      })
      .catch(function (error) {
          console.log(error);
      })
    } catch(error) {
      console.log(error);
    }
  }

  const resetConcession = (conc) => {
    try{
      client.put(`concession/${conc?._id}`,{
        location: conc?.location,
        cost: randValue(conc?.cost),
        resource: randValue(conc?.resource),
        status: UNOWNED,
        owner: ""
      }).then(res => {
        setConcessionOwner("");
        return res;
      }).then(res => {
        console.log("resetConcession", res)
        getConcessionByID(conc?._id);
        getAllConcessions()
      })
      .catch(function (error) {
          console.log(error);
      })
    } catch(error) {
      console.log(error);
    }
  }

  const getConcessionByID = (id) => {
    try{
      client.get(`/concession/${id}`)
      .then(res => {
        console.log("getConcessionByID",res);
        setConcession(res?.data);
        return res?.data;
      })
      .catch(function (error) {
          console.log(error);
      })
    } catch(e) {
      console.log(e);
    }
  }

  const resetConcessions = () => {
    console.log("resetConcessions")
    concessions.map((v) => {
      if(v?.status != UNOWNED){
        // setConcession(v);
        resetConcession(v);
       };
    })
  }

  const randValue = (base) => {
    if(base > 0) {
      return Math.floor(Math.random()*100000);
    }
    else {
      return 0;
    }
  }

  //Player API
  const getPlayer = (id) => (
    client.get(`/player/${id}`)
    .then(res => {
      console.log("getPlayer",res)
      setPlayer(res?.data)
      return res?.data;
    })
    .catch(function (error) {
        console.log(error);
    })
  )
  
  const getAllPlayers = () => {
    client.get(`/player`)
    .then(res => {
      setPlayers(res?.data);
    })
    .catch(function (error) {
        console.log(error);
    })
  }

  const updatePlayerCapitalScore = (capital, score) => (
    client.put(`/player/${player?._id}`,{
      name: player?.name,
      capital: capital,
      score: score
    })
    .then(res => {
      console.log("updatePlayerCapitalScore",res, capital)
      getPlayer();
    })
    .catch(function (error) {
        console.log(error);
    })
  );

  const updatePlayerReady = (ready) => {
    client.put(`/player/${player?._id}`,{
      ready: ready
    })
    .then(res => {
      console.log("updatePlayerReady",res)
      getPlayer(playerID);
    })
    .catch(function (error) {
        console.log(error);
    })
  }

  const getOwnerName = () => {
    if(concession?.owner != "") {
      players?.map((v) => {
          if(v?._id == concession?.owner) {
          setConcessionOwner(v?.name);
        }
      })
    }
    else {
      setConcessionOwner("");
    }
  }

  //Leaderboard API
  const createLeaderboard = (player) => (
    console.log("createdLeaderboard gameID",gameID),
    client.post(`/leaderboard/create`,{
      gameID: gameID,
      name: player?.name,
      score: player?.capital
    })
    .then(res => {
      // if(idx === game?.players) {
        navigate(`/${gameID}/${playerID}/result`)
      // }
      return res;
    })
    .catch(function (error) {
        console.log(error);
    })
  );

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

  const addRound = () => (
    checkEnd(),
    client.patch(`/game/${game?._id}`,{
      round: (game?.round) + 1
    })
    .then(res => {
      console.log("addRound",res)
      setGame(res?.data)
    })
    .catch(function (error) {
        console.log(error);
    })
  );

  const [gamePlayers, setGamePlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const checkEnd = () => {
    console.log("checkend",game)
    if(game?.round >= game?.maxRounds) {
      createLeaderboard(player)
    }
  };

  //UI
  const playerDetails = () => {
    return(
      <>
        <span className='CompanyName'>{player?.name}</span>
        <span className='Capital'>${player?.capital * 1000}</span>
        <Avatar sx={{ bgcolor: (
          (player?.colour == Colour.ORANGE) ? deepOrange[500] : 
          (player?.colour == Colour.PURPLE) ? purple[500] :
          (player?.colour == Colour.GREEN) ? green[500] : blue[500]
        )}} variant="square"></Avatar>
        <span className='Round'>{`${game?.round} / ${game?.maxRounds}`}</span>
      </>
    )
  }

  const concessionDetails = () => {
    return(
      <>
        <span>{concession?.location}</span>
        <span className='status'>Status: {concession?.status}</span>
        {concession?.status === UNOWNED?
          null:
          <span className='owner'>Owner: {concessionOwner}</span>
        }
        {concession?.status === DEVELOPED?
          <span className='value'>Value: ${concession?.resource}</span> :
          <span className='value'>Cost: ${concession?.cost}</span>
        }
        {concession?.status === UNOWNED? <br/>: null}
      </>
    )
  }

  const getConcessionColour = (conc) => {
    var player = players?.find(player => player?._id == conc?.owner);

    return player?.colour;
  }

  const getCellImage = (conc) => {
      //cell is the string of the cell name in map
      var cell = conc?.location;
      var path = "";
      var colour = getConcessionColour(conc);
      var status = conc?.status;

      switch(status) {
        case UNOWNED:
          path = cell + ".png";
          break;
        case OWNED:
          path = cell + colour + ".png";
          break;
        case EXPLORED:
          path = cell + "S" + colour + ".png";
          break;
        case DEVELOPED:
          path = cell + "S" + colour + ".png";
          break;
        default:
          path = cell + ".png";
      }
      document.getElementById(cell).src=require("./images/" + path);
  }

  const theme = createTheme({
    palette: {
      moreGrey: {
        main: '#747474',
        contrastText: '#fff',
      },
    },
  });

  //Button on Click  
  const concessionOnClick = (event) =>{
    getConcessionByID(concessions.find(area => area?.location == event?.target?.id)?._id)
  }

  const buyOnClick = () => {
    playSound();
    console.log("buyOnClick",concession)
    if(player?.capital >= (concession?.cost/1000)) {
      var capital = player?.capital - (concession?.cost/1000) + calcProfit();
      var score = player?.score + 1;
      updatePlayerCapitalScore(capital,score);
      buyConcession(concession?._id);
    }
    else {
      alert("Insufficent capital.");
    }
    updatePlayerReady(true);
    addRound();
  }

  const exploreOnClick = () => {
    playSound();
    console.log("exploreOnClick")
    if(player?.capital >= (concession?.cost/1000)) {
      var capital = player?.capital - (concession?.cost/1000) + calcProfit();
      var score = player?.score + 1;
      updatePlayerCapitalScore(capital,score);
      updateConcession(concession?._id,EXPLORED);
    }
    else {
      alert("Insufficent capital.");
    }
    updatePlayerReady(true);
    addRound();
  }
  
  const developOnClick = () => {
    playSound();
    if(player?.capital >= (concession?.cost/1000)) {
      var capital = player?.capital - (concession?.cost/1000) + calcProfit();
      var score = player?.score + 1;
      if(concession?.resource > 0) {
        score += concession?.resource/1000;
      }
      updatePlayerCapitalScore(capital,score);
      updateConcession(concession?._id,DEVELOPED);
    }
    else {
      alert("Insufficent capital.");
    }
    updatePlayerReady(true);
    addRound();
  }

  const calcProfit = () => {
    var sum = 0;
    concessions.map((v) => {
      if(v?.status == DEVELOPED) {
        console.log(v)
        sum += Number(v?.resource)/1000;
      }
    })

    console.log(sum, player?.capital);
    return sum;
  }

  return(
    <Grid className="Screen-box">
    <Grid
        container spacing={1}
        direction="row"
        justifyContent="space-evenly"
        alignItems="center"
      >
        <Grid item xs= {12} justifyContent="space-between" style={{display: "flex"}} className='header' >
          {playerDetails()}
        </Grid>

        {/* VIVIAN TEST */}
        {/* {arrayBlock([...Array(concessions.length).keys()], 15).map((row, i) => (
            <div key={i} className="row justify-content-center">
                {row.map((value, i) => (
                    <div key={i} className="col">
                        {countAmount()}
                        <img src={require("./images/15.png")} height={35} width={35}/>
                    </div>
                ))}
            </div>
        ))} */}
        {/* END TEST */}

        <Grid item xs={10} container spacing={1} justifyContent="space-evenly" alignItems="center">
            <Grid>
              <Grid className='Column' justifyContent="space-between">
                <img src={require("./images/transparent cell.png")} height={30} width={35} onClick={() => resetConcessions()}/>
                <img src={require("./images/15.png")} height={35} width={35}/>
                <img src={require("./images/14.png")} height={35} width={35}/>
                <img src={require("./images/13.png")} height={35} width={35}/>
                <img src={require("./images/12.png")} height={35} width={35}/>
                <img src={require("./images/11.png")} height={35} width={35}/>
                <img src={require("./images/10.png")} height={35} width={35}/>
                <img src={require("./images/9.png")} height={35} width={35}/>
                <img src={require("./images/8.png")} height={35} width={35}/>
                <img src={require("./images/7.png")} height={35} width={35}/>
                <img src={require("./images/6.png")} height={35} width={35}/>
                <img src={require("./images/5.png")} height={35} width={35}/>
                <img src={require("./images/4.png")} height={35} width={35}/>
                <img src={require("./images/3.png")} height={35} width={35}/>
                <img src={require("./images/2.png")} height={35} width={35}/>
                <img src={require("./images/1.png")} height={35} width={35}/>
                
              </Grid>
              <Grid className='Column1'>
                <img src={require("./images/A.png")} height={30} width={35}/>
                <img className={(concession?.location == 'A15' ? "SelectedCell" : "") + ' A15'} id='A15' src={require("./images/A15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A14' ? "SelectedCell" : "") + ' A14'} id='A14' src={require("./images/A14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A13' ? "SelectedCell" : "") + ' A13'} id='A13' src={require("./images/A13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A12' ? "SelectedCell" : "") + ' A12'} id='A12' src={require("./images/A12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A11' ? "SelectedCell" : "") + ' A11'} id='A11' src={require("./images/A11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A10' ? "SelectedCell" : "") + ' A10'} id='A10' src={require("./images/A10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A9' ? "SelectedCell" : "") + ' A9' }id='A9' src={require("./images/A9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A8' ? "SelectedCell" : "") + ' A8' }id='A8' src={require("./images/A8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A7' ? "SelectedCell" : "") + ' A7' }id='A7' src={require("./images/A7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A6' ? "SelectedCell" : "") + ' A6' }id='A6' src={require("./images/A6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A5' ? "SelectedCell" : "") + ' A5' }id='A5' src={require("./images/A5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A4' ? "SelectedCell" : "") + ' A4' }id='A4' src={require("./images/A4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A3' ? "SelectedCell" : "") + ' A3' }id='A3' src={require("./images/A3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A2' ? "SelectedCell" : "") + ' A2' }id='A2' src={require("./images/A2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A1' ? "SelectedCell" : "") + ' A1' }id='A1' src={require("./images/A1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 2'>
                <img src={require("./images/B.png")} height={30} width={35}/>
                <img className={(concession?.location == 'B15' ? "SelectedCell" : "") + ' B15'} id='B15' src={require("./images/B15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B14' ? "SelectedCell" : "") + ' B14'} id='B14' src={require("./images/B14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B13' ? "SelectedCell" : "") + ' B13'} id='B13' src={require("./images/B13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B12' ? "SelectedCell" : "") + ' B12'} id='B12' src={require("./images/B12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B11' ? "SelectedCell" : "") + ' B11'} id='B11' src={require("./images/B11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B10' ? "SelectedCell" : "") + ' B10'} id='B10' src={require("./images/B10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B9' ? "SelectedCell" : "") + ' B9'} id='B9' src={require("./images/B9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B8' ? "SelectedCell" : "") + ' B8'} id='B8' src={require("./images/B8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B7' ? "SelectedCell" : "") + ' B7'} id='B7' src={require("./images/B7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B6' ? "SelectedCell" : "") + ' B6'} id='B6' src={require("./images/B6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B5' ? "SelectedCell" : "") + ' B5'} id='B5' src={require("./images/B5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B4' ? "SelectedCell" : "") + ' B4'} id='B4' src={require("./images/B4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B3' ? "SelectedCell" : "") + ' B3'} id='B3' src={require("./images/B3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B2' ? "SelectedCell" : "") + ' B2'} id='B2' src={require("./images/B2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B1' ? "SelectedCell" : "") + ' B1'} id='B1' src={require("./images/B1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 3'>
                <img src={require("./images/C.png")} height={30} width={35}/>
                <img className={(concession?.location == 'C15' ? "SelectedCell" : "") + ' C15'} id='C15' src={require("./images/C15.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C14' ? "SelectedCell" : "") + ' C14'} id='C14' src={require("./images/C14.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C13' ? "SelectedCell" : "") + ' C13'} id='C13' src={require("./images/C13.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C12' ? "SelectedCell" : "") + ' C12'} id='C12' src={require("./images/C12.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C11' ? "SelectedCell" : "") + ' C11'} id='C11' src={require("./images/C11.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C10' ? "SelectedCell" : "") + ' C10'} id='C10' src={require("./images/C10.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C9' ? "SelectedCell" : "") + ' C9'} id='C9' src={require("./images/C9.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C8' ? "SelectedCell" : "") + ' C8'} id='C8' src={require("./images/C8.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C7' ? "SelectedCell" : "") + ' C7'} id='C7' src={require("./images/C7.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C6' ? "SelectedCell" : "") + ' C6'} id='C6' src={require("./images/C6.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C5' ? "SelectedCell" : "") + ' C5'} id='C5' src={require("./images/C5.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C4' ? "SelectedCell" : "") + ' C4'} id='C4' src={require("./images/C4.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C3' ? "SelectedCell" : "") + ' C3'} id='C3' src={require("./images/C3.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C2' ? "SelectedCell" : "") + ' C2'} id='C2' src={require("./images/C2.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C1' ? "SelectedCell" : "") + ' C1'} id='C1' src={require("./images/C1.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 4'>
                <img src={require("./images/D.png")} height={30} width={35}/>
                <img className={(concession?.location == 'D15' ? "SelectedCell" : "") + ' D15'} id='D15' src={require("./images/D15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D14' ? "SelectedCell" : "") + ' D14'} id='D14' src={require("./images/D14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D13' ? "SelectedCell" : "") + ' D13'} id='D13' src={require("./images/D13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D12' ? "SelectedCell" : "") + ' D12'} id='D12' src={require("./images/D12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D11' ? "SelectedCell" : "") + ' D11'} id='D11' src={require("./images/D11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D10' ? "SelectedCell" : "") + ' D10'} id='D10' src={require("./images/D10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D9' ? "SelectedCell" : "") + ' D9'} id='D9' src={require("./images/D9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D8' ? "SelectedCell" : "") + ' D8'} id='D8' src={require("./images/D8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D7' ? "SelectedCell" : "") + ' D7'} id='D7' src={require("./images/D7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D6' ? "SelectedCell" : "") + ' D6'} id='D6' src={require("./images/D6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D5' ? "SelectedCell" : "") + ' D5'} id='D5' src={require("./images/D5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D4' ? "SelectedCell" : "") + ' D4'} id='D4' src={require("./images/D4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D3' ? "SelectedCell" : "") + ' D3'} id='D3' src={require("./images/D3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D2' ? "SelectedCell" : "") + ' D2'} id='D2' src={require("./images/D2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D1' ? "SelectedCell" : "") + ' D1'} id='D1' src={require("./images/D1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 5'>
                <img src={require("./images/E.png")} height={30} width={35}/>
                <img className={(concession?.location == 'E15' ? "SelectedCell" : "") + ' E15'} id='E15' src={require("./images/E15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E14' ? "SelectedCell" : "") + ' E14'} id='E14' src={require("./images/E14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E13' ? "SelectedCell" : "") + ' E13'} id='E13' src={require("./images/E13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E12' ? "SelectedCell" : "") + ' E12'} id='E12' src={require("./images/E12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E11' ? "SelectedCell" : "") + ' E11'} id='E11' src={require("./images/E11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E10' ? "SelectedCell" : "") + ' E10'} id='E10' src={require("./images/E10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E9' ? "SelectedCell" : "") + ' E9'} id='E9' src={require("./images/E9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E8' ? "SelectedCell" : "") + ' E8'} id='E8' src={require("./images/E8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E7' ? "SelectedCell" : "") + ' E7'} id='E7' src={require("./images/E7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E6' ? "SelectedCell" : "") + ' E6'} id='E6' src={require("./images/E6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E5' ? "SelectedCell" : "") + ' E5'} id='E5' src={require("./images/E5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E4' ? "SelectedCell" : "") + ' E4'} id='E4' src={require("./images/E4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E3' ? "SelectedCell" : "") + ' E3'} id='E3' src={require("./images/E3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E2' ? "SelectedCell" : "") + ' E2'} id='E2' src={require("./images/E2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E1' ? "SelectedCell" : "") + ' E1'} id='E1' src={require("./images/E1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 6'>
                <img src={require("./images/F.png")} height={30} width={35}/>
                <img className={(concession?.location == 'F15' ? "SelectedCell" : "") + ' F15'} id='F15' src={require("./images/F15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F14' ? "SelectedCell" : "") + ' F14'} id='F14' src={require("./images/F14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F13' ? "SelectedCell" : "") + ' F13'} id='F13' src={require("./images/F13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F12' ? "SelectedCell" : "") + ' F12'} id='F12' src={require("./images/F12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F11' ? "SelectedCell" : "") + ' F11'} id='F11' src={require("./images/F11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F10' ? "SelectedCell" : "") + ' F10'} id='F10' src={require("./images/F10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F9' ? "SelectedCell" : "") + ' F9'} id='F9' src={require("./images/F9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F8' ? "SelectedCell" : "") + ' F8'} id='F8' src={require("./images/F8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F7' ? "SelectedCell" : "") + ' F7'} id='F7' src={require("./images/F7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F6' ? "SelectedCell" : "") + ' F6'} id='F6' src={require("./images/F6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F5' ? "SelectedCell" : "") + ' F5'} id='F5' src={require("./images/F5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F4' ? "SelectedCell" : "") + ' F4'} id='F4' src={require("./images/F4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F3' ? "SelectedCell" : "") + ' F3'} id='F3' src={require("./images/F3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F2' ? "SelectedCell" : "") + ' F2'} id='F2' src={require("./images/F2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F1' ? "SelectedCell" : "") + ' F1'} id='F1' src={require("./images/F1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 7'>
                <img src={require("./images/G.png")} height={30} width={35}/>
                <img className={(concession?.location == 'G15' ? "SelectedCell" : "") + ' G15'} id='G15' src={require("./images/G15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G14' ? "SelectedCell" : "") + ' G14'} id='G14' src={require("./images/G14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G13' ? "SelectedCell" : "") + ' G13'} id='G13' src={require("./images/G13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G12' ? "SelectedCell" : "") + ' G12'} id='G12' src={require("./images/G12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G11' ? "SelectedCell" : "") + ' G11'} id='G11' src={require("./images/G11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G10' ? "SelectedCell" : "") + ' G10'} id='G10' src={require("./images/G10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G9' ? "SelectedCell" : "") + ' G9'} id='G9' src={require("./images/G9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G8' ? "SelectedCell" : "") + ' G8'} id='G8' src={require("./images/G8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G7' ? "SelectedCell" : "") + ' G7'} id='G7' src={require("./images/G7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G6' ? "SelectedCell" : "") + ' G6'} id='G6' src={require("./images/G6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G5' ? "SelectedCell" : "") + ' G5'} id='G5' src={require("./images/G5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G4' ? "SelectedCell" : "") + ' G4'} id='G4' src={require("./images/G4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G3' ? "SelectedCell" : "") + ' G3'} id='G3' src={require("./images/G3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G2' ? "SelectedCell" : "") + ' G2'} id='G2' src={require("./images/G2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G1' ? "SelectedCell" : "") + ' G1'} id='G1' src={require("./images/G1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 8'>
                <img src={require("./images/H.png")} height={30} width={35}/>
                <img className={(concession?.location == 'H15' ? "SelectedCell" : "") + ' H15'} id='H15' src={require("./images/H15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H14' ? "SelectedCell" : "") + ' H14'} id='H14' src={require("./images/H14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H13' ? "SelectedCell" : "") + ' H13'} id='H13' src={require("./images/H13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H12' ? "SelectedCell" : "") + ' H12'} id='H12' src={require("./images/H12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H11' ? "SelectedCell" : "") + ' H11'} id='H11' src={require("./images/H11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H10' ? "SelectedCell" : "") + ' H10'} id='H10' src={require("./images/H10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H9' ? "SelectedCell" : "") + ' H9'} id='H9' src={require("./images/H9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H8' ? "SelectedCell" : "") + ' H8'} id='H8' src={require("./images/H8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H7' ? "SelectedCell" : "") + ' H7'} id='H7' src={require("./images/H7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H6' ? "SelectedCell" : "") + ' H6'} id='H6' src={require("./images/H6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H5' ? "SelectedCell" : "") + ' H5'} id='H5' src={require("./images/H5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H4' ? "SelectedCell" : "") + ' H4'} id='H4' src={require("./images/H4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H3' ? "SelectedCell" : "") + ' H3'} id='H3' src={require("./images/H3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H2' ? "SelectedCell" : "") + ' H2'} id='H2' src={require("./images/H2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H1' ? "SelectedCell" : "") + ' H1'} id='H1' src={require("./images/H1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 9'>
                <img src={require("./images/I.png")} height={30} width={35}/>
                <img className={(concession?.location == 'I15' ? "SelectedCell" : "") + ' I15'} id='I15' src={require("./images/I15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I14' ? "SelectedCell" : "") + ' I14'} id='I14' src={require("./images/I14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I13' ? "SelectedCell" : "") + ' I13'} id='I13' src={require("./images/I13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I12' ? "SelectedCell" : "") + ' I12'} id='I12' src={require("./images/I12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I11' ? "SelectedCell" : "") + ' I11'} id='I11' src={require("./images/I11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I10' ? "SelectedCell" : "") + ' I10'} id='I10' src={require("./images/I10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I9' ? "SelectedCell" : "") + ' I9'} id='I9' src={require("./images/I9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I8' ? "SelectedCell" : "") + ' I8'} id='I8' src={require("./images/I8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I7' ? "SelectedCell" : "") + ' I7'} id='I7' src={require("./images/I7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I6' ? "SelectedCell" : "") + ' I6'} id='I6' src={require("./images/I6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I5' ? "SelectedCell" : "") + ' I5'} id='I5' src={require("./images/I5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I4' ? "SelectedCell" : "") + ' I4'} id='I4' src={require("./images/I4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I3' ? "SelectedCell" : "") + ' I3'} id='I3' src={require("./images/I3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I2' ? "SelectedCell" : "") + ' I2'} id='I2' src={require("./images/I2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I1' ? "SelectedCell" : "") + ' I1'} id='I1' src={require("./images/I1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 10'>
                <img src={require("./images/J.png")} height={30} width={35}/>
                <img className={(concession?.location == 'J15' ? "SelectedCell" : "") + ' J15'} id='J15' src={require("./images/J15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J14' ? "SelectedCell" : "") + ' J14'} id='J14' src={require("./images/J14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J13' ? "SelectedCell" : "") + ' J13'} id='J13' src={require("./images/J13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J12' ? "SelectedCell" : "") + ' J12'} id='J12' src={require("./images/J12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J11' ? "SelectedCell" : "") + ' J11'} id='J11' src={require("./images/J11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J10' ? "SelectedCell" : "") + ' J10'} id='J10' src={require("./images/J10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J9' ? "SelectedCell" : "") + ' J9'} id='J9' src={require("./images/J9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J8' ? "SelectedCell" : "") + ' J8'} id='J8' src={require("./images/J8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J7' ? "SelectedCell" : "") + ' J7'} id='J7' src={require("./images/J7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J6' ? "SelectedCell" : "") + ' J6'} id='J6' src={require("./images/J6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J5' ? "SelectedCell" : "") + ' J5'} id='J5' src={require("./images/J5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J4' ? "SelectedCell" : "") + ' J4'} id='J4' src={require("./images/J4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J3' ? "SelectedCell" : "") + ' J3'} id='J3' src={require("./images/J3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J2' ? "SelectedCell" : "") + ' J2'} id='J2' src={require("./images/J2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J1' ? "SelectedCell" : "") + ' J1'} id='J1' src={require("./images/J1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 11'>
                <img src={require("./images/K.png")} height={30} width={35}/>
                <img className={(concession?.location == 'K15' ? "SelectedCell" : "") + ' K15'} id='K15' src={require("./images/K15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K14' ? "SelectedCell" : "") + ' K14'} id='K14' src={require("./images/K14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K13' ? "SelectedCell" : "") + ' K13'} id='K13' src={require("./images/K13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K12' ? "SelectedCell" : "") + ' K12'} id='K12' src={require("./images/K12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K11' ? "SelectedCell" : "") + ' K11'} id='K11' src={require("./images/K11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K10' ? "SelectedCell" : "") + ' K10'} id='K10' src={require("./images/K10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K9' ? "SelectedCell" : "") + ' K9'} id='K9' src={require("./images/K9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K8' ? "SelectedCell" : "") + ' K8'} id='K8' src={require("./images/K8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K7' ? "SelectedCell" : "") + ' K7'} id='K7' src={require("./images/K7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K6' ? "SelectedCell" : "") + ' K6'} id='K6' src={require("./images/K6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K5' ? "SelectedCell" : "") + ' K5'} id='K5' src={require("./images/K5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K4' ? "SelectedCell" : "") + ' K4'} id='K4' src={require("./images/K4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K3' ? "SelectedCell" : "") + ' K3'} id='K3' src={require("./images/K3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K2' ? "SelectedCell" : "") + ' K2'} id='K2' src={require("./images/K2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K1' ? "SelectedCell" : "") + ' K1'} id='K1' src={require("./images/K1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 12'>
                <img src={require("./images/L.png")} height={30} width={35}/>
                <img className={(concession?.location == 'L15' ? "SelectedCell" : "") + ' L15'} id='L15' src={require("./images/L15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L14' ? "SelectedCell" : "") + ' L14'} id='L14' src={require("./images/L14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L13' ? "SelectedCell" : "") + ' L13'} id='L13' src={require("./images/L13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L12' ? "SelectedCell" : "") + ' L12'} id='L12' src={require("./images/L12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L11' ? "SelectedCell" : "") + ' L11'} id='L11' src={require("./images/L11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L10' ? "SelectedCell" : "") + ' L10'} id='L10' src={require("./images/L10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L9' ? "SelectedCell" : "") + ' L9'} id='L9' src={require("./images/L9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L8' ? "SelectedCell" : "") + ' L8'} id='L8' src={require("./images/L8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L7' ? "SelectedCell" : "") + ' L7'} id='L7' src={require("./images/L7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L6' ? "SelectedCell" : "") + ' L6'} id='L6' src={require("./images/L6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L5' ? "SelectedCell" : "") + ' L5'} id='L5' src={require("./images/L5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L4' ? "SelectedCell" : "") + ' L4'} id='L4' src={require("./images/L4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L3' ? "SelectedCell" : "") + ' L3'} id='L3' src={require("./images/L3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L2' ? "SelectedCell" : "") + ' L2'} id='L2' src={require("./images/L2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L1' ? "SelectedCell" : "") + ' L1'} id='L1' src={require("./images/L1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 13'>
                <img src={require("./images/M.png")} height={30} width={35}/>
                <img className={(concession?.location == 'M15' ? "SelectedCell" : "") + ' M15'} id='M15' src={require("./images/M15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M14' ? "SelectedCell" : "") + ' M14'} id='M14' src={require("./images/M14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M13' ? "SelectedCell" : "") + ' M13'} id='M13' src={require("./images/M13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M12' ? "SelectedCell" : "") + ' M12'} id='M12' src={require("./images/M12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M11' ? "SelectedCell" : "") + ' M11'} id='M11' src={require("./images/M11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M10' ? "SelectedCell" : "") + ' M10'} id='M10' src={require("./images/M10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M9' ? "SelectedCell" : "") + ' M9'} id='M9' src={require("./images/M9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M8' ? "SelectedCell" : "") + ' M8'} id='M8' src={require("./images/M8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M7' ? "SelectedCell" : "") + ' M7'} id='M7' src={require("./images/M7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M6' ? "SelectedCell" : "") + ' M6'} id='M6' src={require("./images/M6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M5' ? "SelectedCell" : "") + ' M5'} id='M5' src={require("./images/M5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M4' ? "SelectedCell" : "") + ' M4'} id='M4' src={require("./images/M4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M3' ? "SelectedCell" : "") + ' M3'} id='M3' src={require("./images/M3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M2' ? "SelectedCell" : "") + ' M2'} id='M2' src={require("./images/M2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M1' ? "SelectedCell" : "") + ' M1'} id='M1' src={require("./images/M1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 14'>
                <img src={require("./images/N.png")} height={30} width={35}/>
                <img className={(concession?.location == 'N15' ? "SelectedCell" : "") + ' N15'} id='N15' src={require("./images/N15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N14' ? "SelectedCell" : "") + ' N14'} id='N14' src={require("./images/N14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N13' ? "SelectedCell" : "") + ' N13'} id='N13' src={require("./images/N13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N12' ? "SelectedCell" : "") + ' N12'} id='N12' src={require("./images/N12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N11' ? "SelectedCell" : "") + ' N11'} id='N11' src={require("./images/N11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N10' ? "SelectedCell" : "") + ' N10'} id='N10' src={require("./images/N10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N9' ? "SelectedCell" : "") + ' N9'} id='N9' src={require("./images/N9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N8' ? "SelectedCell" : "") + ' N8'} id='N8' src={require("./images/N8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N7' ? "SelectedCell" : "") + ' N7'} id='N7' src={require("./images/N7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N6' ? "SelectedCell" : "") + ' N6'} id='N6' src={require("./images/N6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N5' ? "SelectedCell" : "") + ' N5'} id='N5' src={require("./images/N5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N4' ? "SelectedCell" : "") + ' N4'} id='N4' src={require("./images/N4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N3' ? "SelectedCell" : "") + ' N3'} id='N3' src={require("./images/N3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N2' ? "SelectedCell" : "") + ' N2'} id='N2' src={require("./images/N2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N1' ? "SelectedCell" : "") + ' N1'} id='N1' src={require("./images/N1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 15'>
                <img src={require("./images/O.png")} height={30} width={35}/>
                <img className={(concession?.location == 'O15' ? "SelectedCell" : "") + ' O15'} id='O15' src={require("./images/O15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O14' ? "SelectedCell" : "") + ' O14'} id='O14' src={require("./images/O14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O13' ? "SelectedCell" : "") + ' O13'} id='O13' src={require("./images/O13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O12' ? "SelectedCell" : "") + ' O12'} id='O12' src={require("./images/O12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O11' ? "SelectedCell" : "") + ' O11'} id='O11' src={require("./images/O11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O10' ? "SelectedCell" : "") + ' O10'} id='O10' src={require("./images/O10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O9' ? "SelectedCell" : "") + ' O9'} id='O9' src={require("./images/O9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O8' ? "SelectedCell" : "") + ' O8'} id='O8' src={require("./images/O8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O7' ? "SelectedCell" : "") + ' O7'} id='O7' src={require("./images/O7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O6' ? "SelectedCell" : "") + ' O6'} id='O6' src={require("./images/O6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O5' ? "SelectedCell" : "") + ' O5'} id='O5' src={require("./images/O5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O4' ? "SelectedCell" : "") + ' O4'} id='O4' src={require("./images/O4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O3' ? "SelectedCell" : "") + ' O3'} id='O3' src={require("./images/O3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O2' ? "SelectedCell" : "") + ' O2'} id='O2' src={require("./images/O2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O1' ? "SelectedCell" : "") + ' O1'} id='O1' src={require("./images/O1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
            </Grid>
            
            <Grid direction="column" item xs={3} container spacing={2} justifyContent="speace-between" alignItems="center">
              <Grid className='info' direction="column" item xs={3} container spacing={1} justifyContent="space-evenly" alignItems="flex-start">
                {concessionDetails()}
              </Grid>

              <Grid className='buttons' direction="column"  item xs={3} container rowSpacing={0.5} justifyContent="space-between" alignItems="center">
                <ThemeProvider theme={theme}>
                  <Button sx={{ margin: 2 }} variant='contained' color="primary" size="large" startIcon={<AttachMoney/>} disabled={concession?.status != UNOWNED} onClick={() => {buyOnClick(); }} style={{cursor:'pointer'}}>Buy</Button>
                  <Button sx={{ margin: 2 }} variant='contained' color="success" size="large" startIcon={<Science/>} disabled={concession?.status != OWNED} onClick={() => {exploreOnClick() }} style={{cursor:'pointer'}}>Explore</Button>
                  <Button sx={{ margin: 2 }} variant='contained' color="secondary" size="large" startIcon={<Explore/>} disabled={concession?.status != OWNED && concession?.status != EXPLORED} onClick={() => {developOnClick()}} style={{ cursor:'pointer' }}>Develop</Button>
                  <Button sx={{ margin: 2 }} variant='contained' color="moreGrey" size="large" startIcon={<Redo/>} onClick={() => {addRound()}} style={{ cursor:'pointer' }}>Skip</Button>
                </ThemeProvider>
                <ButtonGroup sx={{ margin: 2 }} variant="text" aria-label="outlined button group" size="small">
                  {/* <Button  onClick={() => {playSound(); }}>Settings</Button> */}
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
                        </Dialog> */}
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
        
        {/* <IconButton sx={{ margin: 2 }} size="large" aria-label="Bidding"><GavelIcon fontSize='large' onClick= {handleBidClickOpen }/></IconButton>
                <Dialog open={bidOpen} onClose={handleBidClose}>
                <DialogTitle>Bidding</DialogTitle>
                <DialogContent>
                  <DialogContentText>Blind Bidding For Area *Area*.</DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Your Bidding Amount"
                    type="amount"
                    fullWidth variant="standard"
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleBidClose}>Give Up</Button>
                  <Button onClick={handleBidClose}>Confirm</Button>
                </DialogActions>
              </Dialog>
            
        <IconButton sx={{ margin: 2 }} size="large" aria-label="Bidding Result"><GavelIcon fontSize='large' onClick= {handleBidResultClickOpen }/></IconButton>
                <Dialog
                  open={BidResultOpen}
                  onClose={handleBidResultClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                <DialogTitle id="alert-dialog-title">
                  {"Bidding Result"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Congratulations to *Company Name* with the highest bidding!
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleBidResultClose}>Ok</Button>
                </DialogActions>
              </Dialog> */}
        
      </Grid>
    </Grid>
  );
}

export default MainScreen;