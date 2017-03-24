# reaction-diffusion
![alt tag](rd_demo.gif)

## Run

[See it in action](https://lemmingapex.github.io/reaction-diffusion/)

Open index.html in a web browser that supports webgl2 or greater.

## About

Models a simple [reaction diffusion system](https://en.wikipedia.org/wiki/Reaction%E2%80%93diffusion_system) on a GPU.

The system is described by the Gray-Scott model. Imagine you have two chemicals in a petri dish: chemical A and chemical B.  Both chemicals spread out (diffuse) at different rates.  Both chemicals react with each other over time.  The reactions destroy or produce both chemicals.  In the Gray-Scott model, when two molecules of B and one molecule of A react, they produce one molecule of B.  Chemical A is constantly being added to the system at a quantity proportional to feed rate.  Chemical B is constantly being removed from the system at a quantity proportional to the kill rate plus the feed rate.  By adjusting these rate, you can generate some interesting patterns.  There are many parameters to the system that are not exposed in the GUI which can also significantly change the dynamics of the system.

In the future I would also like to explore other models and differential equations like biological populations or heat convection.

Control GUI from [dat.gui](https://github.com/dataarts/dat.gui)
