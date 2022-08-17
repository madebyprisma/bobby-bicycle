if (event.type === "message") {
    // React with :hehehe: to any youtube link
    if (event.text?.includes("youtube.com") || event.text?.includes("youtu.be")) {
	    interactions.addReaction(event.channel, "hehehe", event.event_ts);
    }
    
    // React with :elmofire: to bobby's name
    if (event.text?.toLowerCase().includes("bobby")) {
        interactions.addReaction(event.channel, "elmofire", event.event_ts);
    }
    
    // React with :this: to positive words
    if (event.text?.toLowerCase().includes("awesome") || event.text?.toLowerCase().includes("amazing")) {
        interactions.addReaction(event.channel, "this", event.event_ts);
    }
    
    // React with :robot_love: to anyhting slackbot says
    if (event.user === "USLACKBOT") {
        interactions.addReaction(event.channel, "robot_love", event.event_ts);
    }
}