import './MainScreen.css';
import { useNavigate, useLocation, useParams} from 'react-router-dom'
import Button from '@mui/material/Button';
import {
  Redo,
  AttachMoney,
  Science,
  Explore,
  AssistantPhoto
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import { blue, deepOrange, green, purple } from '@mui/material/colors';
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
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
import * as Settings from '../../constants/gameSettings';
import {
  getAllConcessions,
  getNoOwnedLand,
  buyConcession,
  getConcession
} from '../Functions/ConcessionFunctions';

function MainScreen() {
  let navigate = useNavigate();
  const location = useLocation();

  const playSound = () =>{
    new Audio(audio).play();
  }

  const host = location?.state?.host;
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
    getAllConcessions().then(data => {
      setConcessions(data);
    });
    
    console.log("initial GetPlayer")
    getPlayer(playerID);

    console.log("initial getGame")
    getGame();
  }, [])

  useEffect(() => {
    console.log("Concession useeffect", concession)
    if(concession != null && players != null) {
      getCellImage(concession);
    }
    getOwnerName();
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

  useEffect(() => {
    checkEnd();
  }, [game]);

  //Concession API
  const updateConcession = (id, newStat) => {
    try{
      client.patch(`concession/${id}`,{
        location: concession?.location,
        cost: concession?.cost,
        resource: concession?.resource,
        status: `${newStat}`
      }).then(res => {
        console.log("updateConcession", res)
        getConcessionByID(concession?._id);
        getAllConcessions().then(data => {
          setConcessions(data);
        })
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
        getAllConcessions().then(data => {
          setConcessions(data);
        });
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
    client.patch(`/player/${player?._id}`,{
      name: player?.name,
      capital: capital,
      score: score
    })
    .then(res => {
      console.log("updatePlayerCapitalScore",res, capital)
      getPlayer(playerID);
    })
    .catch(function (error) {
        console.log(error);
    })
  );

  const updatePlayerReady = (ready) => {
    client.patch(`/player/${player?._id}`,{
      name: player?.name,
      capital: player?.capital,
      score: player?.score,
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

  const getOwnerName = async() => {
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
  const createLeaderboard = () => (
    console.log("createdLeaderboard gameID",gameID),
    client.post(`/leaderboard/create`,{
      gameID: gameID,
      name: player?.name,
      score: player?.capital
    })
    .then(res => {
      navigate(`/${gameID}/${playerID}/result`)
      return res;
    })
    .catch(function (error) {
        console.log(error);
    })
  );

  //Game API
  const getGame = async() => {
    try{
      const res = await client.get(`/game/${gameID}`)
      .then(res => {
        console.log("getGame",res)
        setGame(res?.data)
        return res;
      })
      .catch(function (error) {
          console.log(error);
      })
      const data = await res?.data;
      return data;
    } catch(e) {
      console.log(e);
    }
  };

  const addRound = async() => (
    getGame().then(res => {
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
    })
  );

  const [gamePlayers, setGamePlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const checkEnd = () => {
    console.log("checkend",game)
    if(game?.round >= game?.maxRounds) {
      createLeaderboard()
    }
  };

  const endGame = () => {
    client.patch(`/game/${game?._id}`,{
      round: 20
    })
    .then(res => {
      console.log("endGame",res)
      setGame(res?.data)
      createLeaderboard()
    })
    .catch(function (error) {
      console.log(error)
    });
  }

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
      document.getElementById(cell).src=("https://www.linkpicture.com/q/CurtinCCP" + path);
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
    //check sufficient capital
    if(player?.capital >= (concession?.cost/1000)) {
      //check ownership
      getNoOwnedLand(playerID).then(land => {
        console.log("land",land);
        if(land < Settings.MAX_LAND){
          var capital = player?.capital - (concession?.cost/1000) + calcProfit();
          var score = player?.score + 1;
          updatePlayerCapitalScore(capital,score);
          buyConcession(concession?._id, playerID).then(res => {
            console.log("updateConcession", res);
            getConcession(concession?._id).then(data => {
              console.log("getConcessionByID",data);
              setConcession(data);
            }).then(data => {
              getAllConcessions().then(data => {
                setConcessions(data);
              }).then(res => {
                getPlayer(playerID).then(data => {
                  setPlayer(data);
                });
              })
            })
          })
        }
        else {
          alert("Max undeveloped land owned. Please explore or develop your land.");
        }
      })
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
                        <img src={("./images/15.png")} height={35} width={35}/>
                    </div>
                ))}
            </div>
        ))} */}
        {/* END TEST */}

        <Grid item xs={10} container spacing={1} justifyContent="space-evenly" alignItems="center">
            <Grid>
              <Grid className='Column' justifyContent="space-between">
              <img src={("https://www.linkpicture.com/q/transparent-cell.png")} height={30} width={35} onClick={() => resetConcessions()}/>
                <img src={("https://www.linkpicture.com/q/15_83.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/14_43.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/13_39.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/12_45.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/11_73.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/10_136.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/9_137.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/8_96.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/7_191.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/6_158.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/5_181.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/4_349.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/3_213.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/2_422.png")} height={35} width={35}/>
                <img src={("https://www.linkpicture.com/q/1_711.png")} height={35} width={35}/>
                
              </Grid>
              <Grid className='Column1'>
                <img src={("https://www.linkpicture.com/q/A_1.png")} height={30} width={35}/>
                <img className={(concession?.location == 'A15' ? "SelectedCell" : "") + ' A15'} id='A15' src={("https://www.linkpicture.com/q/CurtinCCPA15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A14' ? "SelectedCell" : "") + ' A14'} id='A14' src={("https://www.linkpicture.com/q/CurtinCCPA14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A13' ? "SelectedCell" : "") + ' A13'} id='A13' src={("https://www.linkpicture.com/q/CurtinCCPA13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A12' ? "SelectedCell" : "") + ' A12'} id='A12' src={("https://www.linkpicture.com/q/CurtinCCPA12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A11' ? "SelectedCell" : "") + ' A11'} id='A11' src={("https://www.linkpicture.com/q/CurtinCCPA11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A10' ? "SelectedCell" : "") + ' A10'} id='A10' src={("https://www.linkpicture.com/q/CurtinCCPA10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A9' ? "SelectedCell" : "") + ' A9' }id='A9' src={("https://www.linkpicture.com/q/CurtinCCPA9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A8' ? "SelectedCell" : "") + ' A8' }id='A8' src={("https://www.linkpicture.com/q/CurtinCCPA8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A7' ? "SelectedCell" : "") + ' A7' }id='A7' src={("https://www.linkpicture.com/q/CurtinCCPA7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A6' ? "SelectedCell" : "") + ' A6' }id='A6' src={("https://www.linkpicture.com/q/CurtinCCPA6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A5' ? "SelectedCell" : "") + ' A5' }id='A5' src={("https://www.linkpicture.com/q/CurtinCCPA5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A4' ? "SelectedCell" : "") + ' A4' }id='A4' src={("https://www.linkpicture.com/q/CurtinCCPA4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A3' ? "SelectedCell" : "") + ' A3' }id='A3' src={("https://www.linkpicture.com/q/CurtinCCPA3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A2' ? "SelectedCell" : "") + ' A2' }id='A2' src={("https://www.linkpicture.com/q/CurtinCCPA2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'A1' ? "SelectedCell" : "") + ' A1' }id='A1' src={("https://www.linkpicture.com/q/CurtinCCPA1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 2'>
                <img src={("https://www.linkpicture.com/q/B_2.png")} height={30} width={35}/>
                <img className={(concession?.location == 'B15' ? "SelectedCell" : "") + ' B15'} id='B15' src={("https://www.linkpicture.com/q/CurtinCCPB15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B14' ? "SelectedCell" : "") + ' B14'} id='B14' src={("https://www.linkpicture.com/q/CurtinCCPB14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B13' ? "SelectedCell" : "") + ' B13'} id='B13' src={("https://www.linkpicture.com/q/CurtinCCPB13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B12' ? "SelectedCell" : "") + ' B12'} id='B12' src={("https://www.linkpicture.com/q/CurtinCCPB12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B11' ? "SelectedCell" : "") + ' B11'} id='B11' src={("https://www.linkpicture.com/q/CurtinCCPB11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B10' ? "SelectedCell" : "") + ' B10'} id='B10' src={("https://www.linkpicture.com/q/CurtinCCPB10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B9' ? "SelectedCell" : "") + ' B9'} id='B9' src={("https://www.linkpicture.com/q/CurtinCCPB9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B8' ? "SelectedCell" : "") + ' B8'} id='B8' src={("https://www.linkpicture.com/q/CurtinCCPB8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B7' ? "SelectedCell" : "") + ' B7'} id='B7' src={("https://www.linkpicture.com/q/CurtinCCPB7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B6' ? "SelectedCell" : "") + ' B6'} id='B6' src={("https://www.linkpicture.com/q/CurtinCCPB6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B5' ? "SelectedCell" : "") + ' B5'} id='B5' src={("https://www.linkpicture.com/q/CurtinCCPB5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B4' ? "SelectedCell" : "") + ' B4'} id='B4' src={("https://www.linkpicture.com/q/CurtinCCPB4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B3' ? "SelectedCell" : "") + ' B3'} id='B3' src={("https://www.linkpicture.com/q/CurtinCCPB3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B2' ? "SelectedCell" : "") + ' B2'} id='B2' src={("https://www.linkpicture.com/q/CurtinCCPB2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'B1' ? "SelectedCell" : "") + ' B1'} id='B1' src={("https://www.linkpicture.com/q/CurtinCCPB1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 3'>
                <img src={("https://www.linkpicture.com/q/C_3.png")} height={30} width={35}/>
                <img className={(concession?.location == 'C15' ? "SelectedCell" : "") + ' C15'} id='C15' src={("https://www.linkpicture.com/q/CurtinCCPC15.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C14' ? "SelectedCell" : "") + ' C14'} id='C14' src={("https://www.linkpicture.com/q/CurtinCCPC14.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C13' ? "SelectedCell" : "") + ' C13'} id='C13' src={("https://www.linkpicture.com/q/CurtinCCPC13.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C12' ? "SelectedCell" : "") + ' C12'} id='C12' src={("https://www.linkpicture.com/q/CurtinCCPC12.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C11' ? "SelectedCell" : "") + ' C11'} id='C11' src={("https://www.linkpicture.com/q/CurtinCCPC11.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C10' ? "SelectedCell" : "") + ' C10'} id='C10' src={("https://www.linkpicture.com/q/CurtinCCPC10.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C9' ? "SelectedCell" : "") + ' C9'} id='C9' src={("https://www.linkpicture.com/q/CurtinCCPC9.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C8' ? "SelectedCell" : "") + ' C8'} id='C8' src={("https://www.linkpicture.com/q/CurtinCCPC8.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C7' ? "SelectedCell" : "") + ' C7'} id='C7' src={("https://www.linkpicture.com/q/CurtinCCPC7.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C6' ? "SelectedCell" : "") + ' C6'} id='C6' src={("https://www.linkpicture.com/q/CurtinCCPC6.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C5' ? "SelectedCell" : "") + ' C5'} id='C5' src={("https://www.linkpicture.com/q/CurtinCCPC5.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C4' ? "SelectedCell" : "") + ' C4'} id='C4' src={("https://www.linkpicture.com/q/CurtinCCPC4.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C3' ? "SelectedCell" : "") + ' C3'} id='C3' src={("https://www.linkpicture.com/q/CurtinCCPC3.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C2' ? "SelectedCell" : "") + ' C2'} id='C2' src={("https://www.linkpicture.com/q/CurtinCCPC2.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'C1' ? "SelectedCell" : "") + ' C1'} id='C1' src={("https://www.linkpicture.com/q/CurtinCCPC1.png")} height={35} width={35}  onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 4'>
                <img src={("https://www.linkpicture.com/q/D_1.png")} height={30} width={35}/>
                <img className={(concession?.location == 'D15' ? "SelectedCell" : "") + ' D15'} id='D15' src={("https://www.linkpicture.com/q/CurtinCCPD15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D14' ? "SelectedCell" : "") + ' D14'} id='D14' src={("https://www.linkpicture.com/q/CurtinCCPD14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D13' ? "SelectedCell" : "") + ' D13'} id='D13' src={("https://www.linkpicture.com/q/CurtinCCPD13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D12' ? "SelectedCell" : "") + ' D12'} id='D12' src={("https://www.linkpicture.com/q/CurtinCCPD12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D11' ? "SelectedCell" : "") + ' D11'} id='D11' src={("https://www.linkpicture.com/q/CurtinCCPD11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D10' ? "SelectedCell" : "") + ' D10'} id='D10' src={("https://www.linkpicture.com/q/CurtinCCPD10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D9' ? "SelectedCell" : "") + ' D9'} id='D9' src={("https://www.linkpicture.com/q/CurtinCCPD9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D8' ? "SelectedCell" : "") + ' D8'} id='D8' src={("https://www.linkpicture.com/q/CurtinCCPD8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D7' ? "SelectedCell" : "") + ' D7'} id='D7' src={("https://www.linkpicture.com/q/CurtinCCPD7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D6' ? "SelectedCell" : "") + ' D6'} id='D6' src={("https://www.linkpicture.com/q/CurtinCCPD6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D5' ? "SelectedCell" : "") + ' D5'} id='D5' src={("https://www.linkpicture.com/q/CurtinCCPD5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D4' ? "SelectedCell" : "") + ' D4'} id='D4' src={("https://www.linkpicture.com/q/CurtinCCPD4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D3' ? "SelectedCell" : "") + ' D3'} id='D3' src={("https://www.linkpicture.com/q/CurtinCCPD3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D2' ? "SelectedCell" : "") + ' D2'} id='D2' src={("https://www.linkpicture.com/q/CurtinCCPD2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'D1' ? "SelectedCell" : "") + ' D1'} id='D1' src={("https://www.linkpicture.com/q/CurtinCCPD1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 5'>
                <img src={("https://www.linkpicture.com/q/E.png")} height={30} width={35}/>
                <img className={(concession?.location == 'E15' ? "SelectedCell" : "") + ' E15'} id='E15' src={("https://www.linkpicture.com/q/CurtinCCPE15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E14' ? "SelectedCell" : "") + ' E14'} id='E14' src={("https://www.linkpicture.com/q/CurtinCCPE14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E13' ? "SelectedCell" : "") + ' E13'} id='E13' src={("https://www.linkpicture.com/q/CurtinCCPE13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E12' ? "SelectedCell" : "") + ' E12'} id='E12' src={("https://www.linkpicture.com/q/CurtinCCPE12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E11' ? "SelectedCell" : "") + ' E11'} id='E11' src={("https://www.linkpicture.com/q/CurtinCCPE11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E10' ? "SelectedCell" : "") + ' E10'} id='E10' src={("https://www.linkpicture.com/q/CurtinCCPE10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E9' ? "SelectedCell" : "") + ' E9'} id='E9' src={("https://www.linkpicture.com/q/CurtinCCPE9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E8' ? "SelectedCell" : "") + ' E8'} id='E8' src={("https://www.linkpicture.com/q/CurtinCCPE8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E7' ? "SelectedCell" : "") + ' E7'} id='E7' src={("https://www.linkpicture.com/q/CurtinCCPE7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E6' ? "SelectedCell" : "") + ' E6'} id='E6' src={("https://www.linkpicture.com/q/CurtinCCPE6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E5' ? "SelectedCell" : "") + ' E5'} id='E5' src={("https://www.linkpicture.com/q/CurtinCCPE5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E4' ? "SelectedCell" : "") + ' E4'} id='E4' src={("https://www.linkpicture.com/q/CurtinCCPE4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E3' ? "SelectedCell" : "") + ' E3'} id='E3' src={("https://www.linkpicture.com/q/CurtinCCPE3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E2' ? "SelectedCell" : "") + ' E2'} id='E2' src={("https://www.linkpicture.com/q/CurtinCCPE2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'E1' ? "SelectedCell" : "") + ' E1'} id='E1' src={("https://www.linkpicture.com/q/CurtinCCPE1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 6'>
                <img src={("https://www.linkpicture.com/q/F_1.png")} height={30} width={35}/>
                <img className={(concession?.location == 'F15' ? "SelectedCell" : "") + ' F15'} id='F15' src={("https://www.linkpicture.com/q/CurtinCCPF15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F14' ? "SelectedCell" : "") + ' F14'} id='F14' src={("https://www.linkpicture.com/q/CurtinCCPF14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F13' ? "SelectedCell" : "") + ' F13'} id='F13' src={("https://www.linkpicture.com/q/CurtinCCPF13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F12' ? "SelectedCell" : "") + ' F12'} id='F12' src={("https://www.linkpicture.com/q/CurtinCCPF12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F11' ? "SelectedCell" : "") + ' F11'} id='F11' src={("https://www.linkpicture.com/q/CurtinCCPF11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F10' ? "SelectedCell" : "") + ' F10'} id='F10' src={("https://www.linkpicture.com/q/CurtinCCPF10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F9' ? "SelectedCell" : "") + ' F9'} id='F9' src={("https://www.linkpicture.com/q/CurtinCCPF9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F8' ? "SelectedCell" : "") + ' F8'} id='F8' src={("https://www.linkpicture.com/q/CurtinCCPF8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F7' ? "SelectedCell" : "") + ' F7'} id='F7' src={("https://www.linkpicture.com/q/CurtinCCPF7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F6' ? "SelectedCell" : "") + ' F6'} id='F6' src={("https://www.linkpicture.com/q/CurtinCCPF6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F5' ? "SelectedCell" : "") + ' F5'} id='F5' src={("https://www.linkpicture.com/q/CurtinCCPF5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F4' ? "SelectedCell" : "") + ' F4'} id='F4' src={("https://www.linkpicture.com/q/CurtinCCPF4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F3' ? "SelectedCell" : "") + ' F3'} id='F3' src={("https://www.linkpicture.com/q/CurtinCCPF3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F2' ? "SelectedCell" : "") + ' F2'} id='F2' src={("https://www.linkpicture.com/q/CurtinCCPF2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'F1' ? "SelectedCell" : "") + ' F1'} id='F1' src={("https://www.linkpicture.com/q/CurtinCCPF1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 7'>
                <img src={("https://www.linkpicture.com/q/G_1.png")} height={30} width={35}/>
                <img className={(concession?.location == 'G15' ? "SelectedCell" : "") + ' G15'} id='G15' src={("https://www.linkpicture.com/q/CurtinCCPG15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G14' ? "SelectedCell" : "") + ' G14'} id='G14' src={("https://www.linkpicture.com/q/CurtinCCPG14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G13' ? "SelectedCell" : "") + ' G13'} id='G13' src={("https://www.linkpicture.com/q/CurtinCCPG13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G12' ? "SelectedCell" : "") + ' G12'} id='G12' src={("https://www.linkpicture.com/q/CurtinCCPG12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G11' ? "SelectedCell" : "") + ' G11'} id='G11' src={("https://www.linkpicture.com/q/CurtinCCPG11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G10' ? "SelectedCell" : "") + ' G10'} id='G10' src={("https://www.linkpicture.com/q/CurtinCCPG10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G9' ? "SelectedCell" : "") + ' G9'} id='G9' src={("https://www.linkpicture.com/q/CurtinCCPG9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G8' ? "SelectedCell" : "") + ' G8'} id='G8' src={("https://www.linkpicture.com/q/CurtinCCPG8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G7' ? "SelectedCell" : "") + ' G7'} id='G7' src={("https://www.linkpicture.com/q/CurtinCCPG7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G6' ? "SelectedCell" : "") + ' G6'} id='G6' src={("https://www.linkpicture.com/q/CurtinCCPG6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G5' ? "SelectedCell" : "") + ' G5'} id='G5' src={("https://www.linkpicture.com/q/CurtinCCPG5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G4' ? "SelectedCell" : "") + ' G4'} id='G4' src={("https://www.linkpicture.com/q/CurtinCCPG4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G3' ? "SelectedCell" : "") + ' G3'} id='G3' src={("https://www.linkpicture.com/q/CurtinCCPG3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G2' ? "SelectedCell" : "") + ' G2'} id='G2' src={("https://www.linkpicture.com/q/CurtinCCPG2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'G1' ? "SelectedCell" : "") + ' G1'} id='G1' src={("https://www.linkpicture.com/q/CurtinCCPG1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 8'>
                <img src={("https://www.linkpicture.com/q/H.png")} height={30} width={35}/>
                <img className={(concession?.location == 'H15' ? "SelectedCell" : "") + ' H15'} id='H15' src={("https://www.linkpicture.com/q/CurtinCCPH15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H14' ? "SelectedCell" : "") + ' H14'} id='H14' src={("https://www.linkpicture.com/q/CurtinCCPH14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H13' ? "SelectedCell" : "") + ' H13'} id='H13' src={("https://www.linkpicture.com/q/CurtinCCPH13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H12' ? "SelectedCell" : "") + ' H12'} id='H12' src={("https://www.linkpicture.com/q/CurtinCCPH12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H11' ? "SelectedCell" : "") + ' H11'} id='H11' src={("https://www.linkpicture.com/q/CurtinCCPH11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H10' ? "SelectedCell" : "") + ' H10'} id='H10' src={("https://www.linkpicture.com/q/CurtinCCPH10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H9' ? "SelectedCell" : "") + ' H9'} id='H9' src={("https://www.linkpicture.com/q/CurtinCCPH9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H8' ? "SelectedCell" : "") + ' H8'} id='H8' src={("https://www.linkpicture.com/q/CurtinCCPH8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H7' ? "SelectedCell" : "") + ' H7'} id='H7' src={("https://www.linkpicture.com/q/CurtinCCPH7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H6' ? "SelectedCell" : "") + ' H6'} id='H6' src={("https://www.linkpicture.com/q/CurtinCCPH6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H5' ? "SelectedCell" : "") + ' H5'} id='H5' src={("https://www.linkpicture.com/q/CurtinCCPH5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H4' ? "SelectedCell" : "") + ' H4'} id='H4' src={("https://www.linkpicture.com/q/CurtinCCPH4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H3' ? "SelectedCell" : "") + ' H3'} id='H3' src={("https://www.linkpicture.com/q/CurtinCCPH3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H2' ? "SelectedCell" : "") + ' H2'} id='H2' src={("https://www.linkpicture.com/q/CurtinCCPH2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'H1' ? "SelectedCell" : "") + ' H1'} id='H1' src={("https://www.linkpicture.com/q/CurtinCCPH1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 9'>
                <img src={("https://www.linkpicture.com/q/I_1.png")} height={30} width={35}/>
                <img className={(concession?.location == 'I15' ? "SelectedCell" : "") + ' I15'} id='I15' src={("https://www.linkpicture.com/q/CurtinCCPI15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I14' ? "SelectedCell" : "") + ' I14'} id='I14' src={("https://www.linkpicture.com/q/CurtinCCPI14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I13' ? "SelectedCell" : "") + ' I13'} id='I13' src={("https://www.linkpicture.com/q/CurtinCCPI13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I12' ? "SelectedCell" : "") + ' I12'} id='I12' src={("https://www.linkpicture.com/q/CurtinCCPI12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I11' ? "SelectedCell" : "") + ' I11'} id='I11' src={("https://www.linkpicture.com/q/CurtinCCPI11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I10' ? "SelectedCell" : "") + ' I10'} id='I10' src={("https://www.linkpicture.com/q/CurtinCCPI10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I9' ? "SelectedCell" : "") + ' I9'} id='I9' src={("https://www.linkpicture.com/q/CurtinCCPI9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I8' ? "SelectedCell" : "") + ' I8'} id='I8' src={("https://www.linkpicture.com/q/CurtinCCPI8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I7' ? "SelectedCell" : "") + ' I7'} id='I7' src={("https://www.linkpicture.com/q/CurtinCCPI7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I6' ? "SelectedCell" : "") + ' I6'} id='I6' src={("https://www.linkpicture.com/q/CurtinCCPI6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I5' ? "SelectedCell" : "") + ' I5'} id='I5' src={("https://www.linkpicture.com/q/CurtinCCPI5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I4' ? "SelectedCell" : "") + ' I4'} id='I4' src={("https://www.linkpicture.com/q/CurtinCCPI4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I3' ? "SelectedCell" : "") + ' I3'} id='I3' src={("https://www.linkpicture.com/q/CurtinCCPI3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I2' ? "SelectedCell" : "") + ' I2'} id='I2' src={("https://www.linkpicture.com/q/CurtinCCPI2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'I1' ? "SelectedCell" : "") + ' I1'} id='I1' src={("https://www.linkpicture.com/q/CurtinCCPI1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 10'>
                <img src={("https://www.linkpicture.com/q/J.png")} height={30} width={35}/>
                <img className={(concession?.location == 'J15' ? "SelectedCell" : "") + ' J15'} id='J15' src={("https://www.linkpicture.com/q/CurtinCCPJ15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J14' ? "SelectedCell" : "") + ' J14'} id='J14' src={("https://www.linkpicture.com/q/CurtinCCPJ14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J13' ? "SelectedCell" : "") + ' J13'} id='J13' src={("https://www.linkpicture.com/q/CurtinCCPJ13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J12' ? "SelectedCell" : "") + ' J12'} id='J12' src={("https://www.linkpicture.com/q/CurtinCCPJ12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J11' ? "SelectedCell" : "") + ' J11'} id='J11' src={("https://www.linkpicture.com/q/CurtinCCPJ11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J10' ? "SelectedCell" : "") + ' J10'} id='J10' src={("https://www.linkpicture.com/q/CurtinCCPJ10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J9' ? "SelectedCell" : "") + ' J9'} id='J9' src={("https://www.linkpicture.com/q/CurtinCCPJ9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J8' ? "SelectedCell" : "") + ' J8'} id='J8' src={("https://www.linkpicture.com/q/CurtinCCPJ8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J7' ? "SelectedCell" : "") + ' J7'} id='J7' src={("https://www.linkpicture.com/q/CurtinCCPJ7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J6' ? "SelectedCell" : "") + ' J6'} id='J6' src={("https://www.linkpicture.com/q/CurtinCCPJ6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J5' ? "SelectedCell" : "") + ' J5'} id='J5' src={("https://www.linkpicture.com/q/CurtinCCPJ5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J4' ? "SelectedCell" : "") + ' J4'} id='J4' src={("https://www.linkpicture.com/q/CurtinCCPJ4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J3' ? "SelectedCell" : "") + ' J3'} id='J3' src={("https://www.linkpicture.com/q/CurtinCCPJ3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J2' ? "SelectedCell" : "") + ' J2'} id='J2' src={("https://www.linkpicture.com/q/CurtinCCPJ2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'J1' ? "SelectedCell" : "") + ' J1'} id='J1' src={("https://www.linkpicture.com/q/CurtinCCPJ1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 11'>
                <img src={("https://www.linkpicture.com/q/K.png")} height={30} width={35}/>
                <img className={(concession?.location == 'K15' ? "SelectedCell" : "") + ' K15'} id='K15' src={("https://www.linkpicture.com/q/CurtinCCPK15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K14' ? "SelectedCell" : "") + ' K14'} id='K14' src={("https://www.linkpicture.com/q/CurtinCCPK14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K13' ? "SelectedCell" : "") + ' K13'} id='K13' src={("https://www.linkpicture.com/q/CurtinCCPK13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K12' ? "SelectedCell" : "") + ' K12'} id='K12' src={("https://www.linkpicture.com/q/CurtinCCPK12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K11' ? "SelectedCell" : "") + ' K11'} id='K11' src={("https://www.linkpicture.com/q/CurtinCCPK11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K10' ? "SelectedCell" : "") + ' K10'} id='K10' src={("https://www.linkpicture.com/q/CurtinCCPK10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K9' ? "SelectedCell" : "") + ' K9'} id='K9' src={("https://www.linkpicture.com/q/CurtinCCPK9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K8' ? "SelectedCell" : "") + ' K8'} id='K8' src={("https://www.linkpicture.com/q/CurtinCCPK8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K7' ? "SelectedCell" : "") + ' K7'} id='K7' src={("https://www.linkpicture.com/q/CurtinCCPK7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K6' ? "SelectedCell" : "") + ' K6'} id='K6' src={("https://www.linkpicture.com/q/CurtinCCPK6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K5' ? "SelectedCell" : "") + ' K5'} id='K5' src={("https://www.linkpicture.com/q/CurtinCCPK5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K4' ? "SelectedCell" : "") + ' K4'} id='K4' src={("https://www.linkpicture.com/q/CurtinCCPK4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K3' ? "SelectedCell" : "") + ' K3'} id='K3' src={("https://www.linkpicture.com/q/CurtinCCPK3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K2' ? "SelectedCell" : "") + ' K2'} id='K2' src={("https://www.linkpicture.com/q/CurtinCCPK2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'K1' ? "SelectedCell" : "") + ' K1'} id='K1' src={("https://www.linkpicture.com/q/CurtinCCPK1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 12'>
                <img src={("https://www.linkpicture.com/q/L_1.png")} height={30} width={35}/>
                <img className={(concession?.location == 'L15' ? "SelectedCell" : "") + ' L15'} id='L15' src={("https://www.linkpicture.com/q/CurtinCCPL15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L14' ? "SelectedCell" : "") + ' L14'} id='L14' src={("https://www.linkpicture.com/q/CurtinCCPL14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L13' ? "SelectedCell" : "") + ' L13'} id='L13' src={("https://www.linkpicture.com/q/CurtinCCPL13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L12' ? "SelectedCell" : "") + ' L12'} id='L12' src={("https://www.linkpicture.com/q/CurtinCCPL12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L11' ? "SelectedCell" : "") + ' L11'} id='L11' src={("https://www.linkpicture.com/q/CurtinCCPL11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L10' ? "SelectedCell" : "") + ' L10'} id='L10' src={("https://www.linkpicture.com/q/CurtinCCPL10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L9' ? "SelectedCell" : "") + ' L9'} id='L9' src={("https://www.linkpicture.com/q/CurtinCCPL9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L8' ? "SelectedCell" : "") + ' L8'} id='L8' src={("https://www.linkpicture.com/q/CurtinCCPL8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L7' ? "SelectedCell" : "") + ' L7'} id='L7' src={("https://www.linkpicture.com/q/CurtinCCPL7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L6' ? "SelectedCell" : "") + ' L6'} id='L6' src={("https://www.linkpicture.com/q/CurtinCCPL6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L5' ? "SelectedCell" : "") + ' L5'} id='L5' src={("https://www.linkpicture.com/q/CurtinCCPL5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L4' ? "SelectedCell" : "") + ' L4'} id='L4' src={("https://www.linkpicture.com/q/CurtinCCPL4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L3' ? "SelectedCell" : "") + ' L3'} id='L3' src={("https://www.linkpicture.com/q/CurtinCCPL3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L2' ? "SelectedCell" : "") + ' L2'} id='L2' src={("https://www.linkpicture.com/q/CurtinCCPL2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'L1' ? "SelectedCell" : "") + ' L1'} id='L1' src={("https://www.linkpicture.com/q/CurtinCCPL1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 13'>
                <img src={("https://www.linkpicture.com/q/M_1.png")} height={30} width={35}/>
                <img className={(concession?.location == 'M15' ? "SelectedCell" : "") + ' M15'} id='M15' src={("https://www.linkpicture.com/q/CurtinCCPM15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M14' ? "SelectedCell" : "") + ' M14'} id='M14' src={("https://www.linkpicture.com/q/CurtinCCPM14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M13' ? "SelectedCell" : "") + ' M13'} id='M13' src={("https://www.linkpicture.com/q/CurtinCCPM13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M12' ? "SelectedCell" : "") + ' M12'} id='M12' src={("https://www.linkpicture.com/q/CurtinCCPM12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M11' ? "SelectedCell" : "") + ' M11'} id='M11' src={("https://www.linkpicture.com/q/CurtinCCPM11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M10' ? "SelectedCell" : "") + ' M10'} id='M10' src={("https://www.linkpicture.com/q/CurtinCCPM10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M9' ? "SelectedCell" : "") + ' M9'} id='M9' src={("https://i.postimg.cc/Dyy56F5m/CurtinCCPM9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M8' ? "SelectedCell" : "") + ' M8'} id='M8' src={("https://www.linkpicture.com/q/CurtinCCPM8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M7' ? "SelectedCell" : "") + ' M7'} id='M7' src={("https://www.linkpicture.com/q/CurtinCCPM7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M6' ? "SelectedCell" : "") + ' M6'} id='M6' src={("https://www.linkpicture.com/q/CurtinCCPM6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M5' ? "SelectedCell" : "") + ' M5'} id='M5' src={("https://www.linkpicture.com/q/CurtinCCPM5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M4' ? "SelectedCell" : "") + ' M4'} id='M4' src={("https://www.linkpicture.com/q/CurtinCCPM4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M3' ? "SelectedCell" : "") + ' M3'} id='M3' src={("https://www.linkpicture.com/q/CurtinCCPM3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M2' ? "SelectedCell" : "") + ' M2'} id='M2' src={("https://www.linkpicture.com/q/CurtinCCPM2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'M1' ? "SelectedCell" : "") + ' M1'} id='M1' src={("https://www.linkpicture.com/q/CurtinCCPM1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 14'>
                <img src={("https://www.linkpicture.com/q/N.png")} height={30} width={35}/>
                <img className={(concession?.location == 'N15' ? "SelectedCell" : "") + ' N15'} id='N15' src={("https://www.linkpicture.com/q/CurtinCCPN15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N14' ? "SelectedCell" : "") + ' N14'} id='N14' src={("https://www.linkpicture.com/q/CurtinCCPN14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N13' ? "SelectedCell" : "") + ' N13'} id='N13' src={("https://www.linkpicture.com/q/CurtinCCPN13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N12' ? "SelectedCell" : "") + ' N12'} id='N12' src={("https://www.linkpicture.com/q/CurtinCCPN12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N11' ? "SelectedCell" : "") + ' N11'} id='N11' src={("https://www.linkpicture.com/q/CurtinCCPN11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N10' ? "SelectedCell" : "") + ' N10'} id='N10' src={("https://www.linkpicture.com/q/CurtinCCPN10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N9' ? "SelectedCell" : "") + ' N9'} id='N9' src={("https://www.linkpicture.com/q/CurtinCCPN9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N8' ? "SelectedCell" : "") + ' N8'} id='N8' src={("https://www.linkpicture.com/q/CurtinCCPN8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N7' ? "SelectedCell" : "") + ' N7'} id='N7' src={("https://www.linkpicture.com/q/CurtinCCPN7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N6' ? "SelectedCell" : "") + ' N6'} id='N6' src={("https://www.linkpicture.com/q/CurtinCCPN6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N5' ? "SelectedCell" : "") + ' N5'} id='N5' src={("https://www.linkpicture.com/q/CurtinCCPN5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N4' ? "SelectedCell" : "") + ' N4'} id='N4' src={("https://www.linkpicture.com/q/CurtinCCPN4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N3' ? "SelectedCell" : "") + ' N3'} id='N3' src={("https://www.linkpicture.com/q/CurtinCCPN3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N2' ? "SelectedCell" : "") + ' N2'} id='N2' src={("https://www.linkpicture.com/q/CurtinCCPN2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'N1' ? "SelectedCell" : "") + ' N1'} id='N1' src={("https://www.linkpicture.com/q/CurtinCCPN1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
              </Grid>
              <Grid className='Column 15'>
                <img src={("https://www.linkpicture.com/q/O_1.png")} height={30} width={35}/>
                <img className={(concession?.location == 'O15' ? "SelectedCell" : "") + ' O15'} id='O15' src={("https://www.linkpicture.com/q/CurtinCCPO15.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O14' ? "SelectedCell" : "") + ' O14'} id='O14' src={("https://www.linkpicture.com/q/CurtinCCPO14.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O13' ? "SelectedCell" : "") + ' O13'} id='O13' src={("https://www.linkpicture.com/q/CurtinCCPO13.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O12' ? "SelectedCell" : "") + ' O12'} id='O12' src={("https://www.linkpicture.com/q/CurtinCCPO12.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O11' ? "SelectedCell" : "") + ' O11'} id='O11' src={("https://www.linkpicture.com/q/CurtinCCPO11.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O10' ? "SelectedCell" : "") + ' O10'} id='O10' src={("https://www.linkpicture.com/q/CurtinCCPO10.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O9' ? "SelectedCell" : "") + ' O9'} id='O9' src={("https://www.linkpicture.com/q/CurtinCCPO9.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O8' ? "SelectedCell" : "") + ' O8'} id='O8' src={("https://www.linkpicture.com/q/CurtinCCPO8.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O7' ? "SelectedCell" : "") + ' O7'} id='O7' src={("https://www.linkpicture.com/q/CurtinCCPO7.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O6' ? "SelectedCell" : "") + ' O6'} id='O6' src={("https://www.linkpicture.com/q/CurtinCCPO6.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O5' ? "SelectedCell" : "") + ' O5'} id='O5' src={("https://www.linkpicture.com/q/CurtinCCPO5.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O4' ? "SelectedCell" : "") + ' O4'} id='O4' src={("https://www.linkpicture.com/q/CurtinCCPO4.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O3' ? "SelectedCell" : "") + ' O3'} id='O3' src={("https://www.linkpicture.com/q/CurtinCCPO3.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O2' ? "SelectedCell" : "") + ' O2'} id='O2' src={("https://www.linkpicture.com/q/CurtinCCPO2.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
                <img className={(concession?.location == 'O1' ? "SelectedCell" : "") + ' O1'} id='O1' src={("https://www.linkpicture.com/q/CurtinCCPO1.png")} height={35} width={35} onClick={(e) => {concessionOnClick(e);}}/>
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
                  {host?
                    <Button sx={{ margin: 2 }} variant='contained' color="moreGrey" size="large" startIcon={<AssistantPhoto/>} onClick={() => {endGame()}} style={{ cursor:'pointer' }}>End Game</Button> :
                    null
                  }
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
                          3. What is the GPU ment for Oil Corps?<br/>
                          <Typography className='answer'>A dedicated grapic card is not d in your system. However, it is important to know that an integrated graphic card is d to make output to the monitor.</Typography><div id="just-line-break"></div><br/>
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