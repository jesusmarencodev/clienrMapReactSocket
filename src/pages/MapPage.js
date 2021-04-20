import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';

import { useMapbox } from '../hooks/useMapbox';


const puntoInicial = {
  lng :-122.4725,
  lat:  37.8010,
  zoom:13.5
}

export const MapPage = () => {

  const { coords, setRef, nuevoMarcador$, movimientoMarcador$ } = useMapbox(puntoInicial);

  const { socket } = useContext(SocketContext);

  //nuevo marcador
  useEffect(() => {
    nuevoMarcador$.subscribe(marcador => {
      socket.emit('marcador-nuevo', marcador);
    })
  }, [nuevoMarcador$, socket]);

  //movimientos de marcador
  useEffect(() => {
    movimientoMarcador$.subscribe(marcador => {
      console.log(marcador.id)
    })
  }, [movimientoMarcador$]);


  //escuchar nuevos marcadores
  useEffect(() => {
    socket.on('marcador-nuevo', (marcador)=>{
      console.log(marcador)
    });
  }, [socket]);


  return (
    <>
    <div className="info">
      Lng : {coords.lng} | lat: {coords.lat} | zoom : {coords.zoom}
    </div>
      <div
        ref={setRef}
        className="mapContainer"
      />
    </>
  )
}
