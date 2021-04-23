import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';

import { useMapbox } from '../hooks/useMapbox';


const puntoInicial = {
  lng :-122.4725,
  lat:  37.8010,
  zoom:13.5
}

export const MapPage = () => {

  const { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMapbox(puntoInicial);

  const { socket } = useContext(SocketContext);

  //escuchar los marcadores existentes
  useEffect(() => {
    socket.on('marcadores-activos', (marcadores)=>{
      for (const key of Object.keys(marcadores)) {
        agregarMarcador(marcadores[key], key);
      } 
    });
  }, [socket, agregarMarcador])

  //nuevo marcador
  useEffect(() => {
    nuevoMarcador$.subscribe(marcador => {
      socket.emit('marcador-nuevo', marcador);
    })
  }, [nuevoMarcador$, socket]);

  //movimientos de marcador
  useEffect(() => {
    movimientoMarcador$.subscribe(marcador => {
      socket.emit('marcador-actualizado', marcador);
    })
  }, [socket, movimientoMarcador$]);


  //mover marcador mediante socket
  useEffect(() => {
    socket.on('marcador-actualizado', (marcador)=>{
      actualizarPosicion(marcador);
    });
  }, [socket, actualizarPosicion]);


  //escuchar nuevos marcadores
  useEffect(() => {
    socket.on('marcador-nuevo', (marcador)=>{
      agregarMarcador(marcador, marcador.id);
      console.log(marcador)
    });
  }, [socket, agregarMarcador]);


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
