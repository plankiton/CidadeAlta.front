import {useState, useEffect} from 'react';
import axios from 'axios';
import './style.css';

var api_url = 'http://localhost:5000/api';
var conf = {
    headers: {
        'Control-Allow-Headers': 'Authorization',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
}

function getType(t) {
    switch (t) {
        case 'Trade':
            return 'Transferência';
        case 'TakeIn':
            return 'Depósito';
        case 'TakeOut':
            return 'Saque';
        default:
            return 'Saldo';
    }
}

function sleep(s) {
  return new Promise(
    resolve => setTimeout(resolve, s*10)
  );
}

function App() {
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        async function updateData(){
            if (user){

                axios.get(`${api_url}/Client/${user.password}/${user.id}`, conf).then((r) => {
                    console.log(r);
                    if (r.data.balance !== user.balance){
                        setUser({
                            id: r.data.id,
                            name: r.data.name,
                            password: user.password,
                            balance: r.data.balance,
                        });

                        axios.get(`${api_url}/Operation/${user.password}/${user.id}`, conf).then((r) => {
                            if (r.data !== history){
                                setHistory(r.data);
                                console.log(r.data);
                            }
                        });
                    }});

            }
        }

        updateData();
    });

    return user == null ? (
        <div id="login">
            <form className="login" onSubmit={(e) => {
                e.preventDefault();

                var name = e.target[0].value;
                var pass = e.target[1].value;
                axios.get(`${api_url}/Client/byname/${pass}/${name}`, conf)
                    .then((r) => {
                        console.log(r);
                        setUser({
                            id: r.data.id,
                            name: r.data.name,
                            password: pass,
                            balance: r.data.balance,
                        });
                    }).catch((e) => {
                        axios.post(`${api_url}/Client`, {
                            name: name,
                            password: pass
                        }, conf).then((r) => {
                            console.log(r);

                            setUser({
                                id: r.data.id,
                                name: r.data.name,
                                password: pass,
                                balance: r.data.balance,
                            });
                        }).catch((e) => {
                            console.log(e);
                        }).finally(() => {
                            console.log(pass, name);
                        });

                    });

            }}>
                <h1>Login</h1>
                <label htmlFor="user">Usuário</label>
                <input type="text" name="user" id="user"/>

                <label htmlFor="password">password</label>
                <input type="password" name="password" id="password"/>

                <p className='sign-up'>Se não tiver conta será criada</p>
                <input type="submit" name="send" id="send" value="Enviar"/>
            </form>
        </div>
    ) : (
        <div id="conta">
            <h1 className="user">{user.name}</h1>
            <p className="balance">Saldo: <span className="money">{user.balance.toFixed(2)} reais</span></p>

            <form className="function" onSubmit={(e) => {
                e.preventDefault();
                console.log(parseFloat(e.target[0].value));
                axios.post(`${api_url}/TakeIn`, {
                    clientid: user.id,
                    value: parseFloat(e.target[0].value),
                    password: user.password,
                }, conf).then((r) => {
                    axios.get(`${api_url}/Client/${user.password}/${user.id}`, conf).then((r) => {
                        console.log(r);
                        if (r.data.balance !== user.balance){
                            setUser({
                                id: r.data.id,
                                name: r.data.name,
                                password: user.password,
                                balance: r.data.balance,
                            });
                        }});
                }).catch((e) => {
                    console.log(e);
                });
                }}>
                <label htmlFor="takein">Depositar dinheiro:</label>
                <input type="text" name="takein" id="takein" placeholder="Valor do deposito"/>
                <input type="submit" value="Depositar"/>
            </form>
            <form className="function" onSubmit={(e) => {
                e.preventDefault();
                console.log(parseFloat(e.target[0].value));
                axios.post(`${api_url}/TakeOut`, {
                    clientid: user.id,
                    password: user.password,
                    value: parseFloat(e.target[0].value)
                }, conf).then((r) => {
                    axios.get(`${api_url}/Client/${user.password}/${user.id}`, conf).then((r) => {
                        console.log(r);
                        if (r.data.balance !== user.balance){
                            setUser({
                                id: r.data.id,
                                name: r.data.name,
                                password: user.password,
                                balance: r.data.balance,
                            });
                        }});
                }).catch((e) => {
                    console.log(e);
                });
                }}>
                <label htmlFor="takeout">Sacar dinheiro:</label>
                <input type="text" name="takeout" id="takeout" placeholder="Valor do saque"/>
                <input type="submit" value="Sacar"/>
            </form>
            <form className="function" onSubmit={(e) => {
                e.preventDefault();
                console.log(parseFloat(e.target[0].value));
                axios.post(`${api_url}/Trade`, {
                    senderid: user.id,
                    password: user.password,
                    receiverid: parseInt(e.target[1].value),
                    value: parseFloat(e.target[0].value)
                }, conf).then((r) => {
                    axios.get(`${api_url}/Client/${user.password}/${user.id}`, conf).then((r) => {
                        console.log(r);
                        if (r.data.balance !== user.balance){
                            setUser({
                                id: r.data.id,
                                name: r.data.name,
                                password: user.password,
                                balance: r.data.balance,
                            });
                        }});
                }).catch((e) => {
                    console.log(e);
                });
                }}>
                <label htmlFor="trade">Transferir dinheiro:</label>
                <input type="text" name="trade" id="trade" placeholder="Valor da transferencia"/>
                <label htmlFor="receiver">Destinário:</label>
                <input type="text" name="receiver" id="receiver" placeholder="Username do receiver"/>
                <input type="submit" value="Transferencia"/>
            </form>

            <div>
                <h3 className="title">Extrato da conta</h3>

                <div className="operation-list">{
                    history.map((o) => {

                        var d = new Date(o.date);
                        o.date = d.toString().substring(0, 21);
                        return o.type !== "GetClient" ? (<div className="operation">
                            <p className="type">
                                {getType(o.type)}
                                { o.value ? (<span> de <span className="money">{parseFloat(o.value).toFixed(2)} reais</span></span>): "" }
                                { o.receiver ? ` para ${o.receiver}` : "" }
                                { o.sender && o.sender !== user.id.ToString() ? `de ${o.sender}` : "" }
                            </p>
                            <p className="date">{ o.date }</p>
                        </div>) : '';

                    })

                    }</div>

            </div>
        </div>
    );
}

export default App;
