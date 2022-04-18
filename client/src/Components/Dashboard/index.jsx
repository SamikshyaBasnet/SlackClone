// import './dashboard.css'
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/index'
import { useEffect, useState } from 'react';
import SendMessage from '../SendMessage/';
import Header from '../Header/';
import Messages from '../Messages/';
import SendMessages from '../Messages/message.jsx';
import ActiveUserList from '../ActiveUserList/';
import { loadUserData, isUserAuth, loadReminders, updateActiveState, updateActiveUserList } from '../../actions';
import { useDispatch, useSelector } from 'react-redux';
import Axios from '../API/api';
import '../../App.css';

function Dashboard() {

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    // Get State from Redux Store
    const user = useSelector((state) => state.user);
    const userId = user.userId;

    const { activeWorkspace } = useSelector((state) => state.chat);
    // console.log("active workspace", activeWorkspace);

    const dispatch = useDispatch();

    // Also fetches new list of active users in activeWorkspace
    const updateActiveStatus = () => {
        dispatch(updateActiveState());
        dispatch(updateActiveUserList(activeWorkspace.split('-')[1]));
        setTimeout(updateActiveStatus, 5 * 60000);
    };

    // Listens for changes on isSignedIn
    // Gets initial user data upon change
    const navigate = useNavigate()

    useEffect(() => {
        if (!user.isSignedIn) {
            navigate('/');
        } else {
            navigate('/dashboard')
            const res = dispatch(loadUserData(userId));
            console.log("load user dTata", res);
            updateActiveStatus();
            dispatch(loadReminders(userId));
        }
    }, [dispatch, user.isSignedIn, user.userId]);


    useEffect(() => {
        checkLocalStorageAuth()
    }, [])

    const checkLocalStorageAuth = () => {
        const user = localStorage.getItem('userId');
        console.log("user =", user);

        if (user) {
            dispatch(loadUserData(user));
            navigate('/dashboard')
        }
        Axios.get("/user/isUserAuth", {
            headers: {
                "x-access-token": localStorage.getItem("token"),
            }
        }
        ).then((response) => {
            console.log("token", response);
            if (response.data.auth === true) {
                dispatch(isUserAuth(response.data))
                navigate('/dashboard');
            }
        })
    };

    // Watches viewport height (fix for mobile address bar size)
    window.addEventListener('resize', () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
    return (

        <div className="dashboard">
            <div className="grid-container">
                <div className="sidebar-grid">
                    <Sidebar />
                </div>

                <div className="messages-grid">
                    <Header
                        setModalVisible={setModalVisible}
                        setModalType={setModalType}
                    />
                    <SendMessages />
                </div>

                <div className="user-list-grid">
                    <ActiveUserList />

                </div>

                {/* <div className="send-messages-grid">
                    <SendMessage />
                </div> */}
            </div>

        </div>
    )
}

export default Dashboard