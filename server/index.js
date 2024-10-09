const express = require('express');

require('dotenv').config();
const app= express();

const cors = require('cors');
const AuthRouter = require('./Routes/AuthRoute');
const ActivityRoutes = require('./Routes/activityRoutes');


const PORT = process.env.PORT || 8080;



app.use(express.json());

app.use(cors());
app.use('/auth',AuthRouter);
app.use('/api',ActivityRoutes);

app.get('/ping',(req,res)=>{
    res.send('PONG');
})

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})

