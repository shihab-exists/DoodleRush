var express=require('express'),path=require('path'),app=express();
app.use(express.static(path.join(__dirname)));
app.listen(process.env.PORT||3000,function(){console.log('Doodle Rush live')});
