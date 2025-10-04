const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Logro = require('../models/Logro');
const LogroUnlocked = require('../models/Logro_unlocked');
const Progreso = require('../models/Progreso');
const Tarea = require('../models/Tarea');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtener todos los logros
router.get("/allogros", async (req, res) => {
  try {
    const logros = await Logro.find();
    res.json(logros);
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener los logros" });
  }
});

// Obtener logros del usuario con progreso
router.get("/mislogros", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Obtener todos los logros
    const todosLogros = await Logro.find();
    
    // Obtener logros desbloqueados por el usuario
    const logrosDesbloqueados = await LogroUnlocked.find({ id_usuario: userId })
      .populate('id_logro');
    
    // Obtener estadísticas del usuario
    const progresoUsuario = await Progreso.find({ id_usuario: userId, correcto: true });
    const tareasCompletadas = progresoUsuario.length;
    const puntajeTotal = progresoUsuario.reduce((sum, p) => sum + (p.puntaje || 0), 0);
    
    // Calcular bloques completados
    const bloquesCompletados = [];
    const bloques = [1, 2, 3, 4, 5, 6];
    
    for (const bloque of bloques) {
      const tareasBloque = await Tarea.find({ bloque });
      if (tareasBloque.length > 0) {
        const tareasCompletadasBloque = await Progreso.find({
          id_usuario: userId,
          id_tarea: { $in: tareasBloque.map(t => t._id) },
          correcto: true
        });
        
        if (tareasCompletadasBloque.length === tareasBloque.length) {
          bloquesCompletados.push(bloque);
        }
      }
    }
    
    // Calcular racha actual
    const ultimasTareas = await Progreso.find({ id_usuario: userId })
      .sort({ fecha_progreso: -1 })
      .limit(10)
      .populate('id_tarea');
    
    let rachaActual = 0;
    for (const progreso of ultimasTareas) {
      if (progreso.correcto) {
        rachaActual++;
      } else {
        break;
      }
    }
    
    // Preparar respuesta con progreso para cada logro
    const logrosConProgreso = todosLogros.map(logro => {
      const desbloqueadoObj = logrosDesbloqueados.find(ld => 
        ld.id_logro._id.toString() === logro._id.toString()
      );
      
      const desbloqueado = !!desbloqueadoObj;
      
      let progresoActual = 0;
      let meta = logro.meta;
      let porcentaje = 0;
      
      switch (logro.tipo) {
        case 'tareas_completadas':
          if (logro.logro === 'Racha Perfecta') {
            progresoActual = rachaActual;
            porcentaje = Math.min(100, (rachaActual / meta) * 100);
          } else {
            progresoActual = tareasCompletadas;
            porcentaje = Math.min(100, (tareasCompletadas / meta) * 100);
          }
          break;
          
        case 'puntaje':
          progresoActual = puntajeTotal;
          porcentaje = Math.min(100, (puntajeTotal / meta) * 100);
          break;
          
        case 'bloque':
          if (logro.bloque) {
            progresoActual = bloquesCompletados.includes(logro.bloque) ? 1 : 0;
            porcentaje = bloquesCompletados.includes(logro.bloque) ? 100 : 0;
            meta = 1;
          } else {
            // Logro "Sin Errores"
            const bloqueSinErrores = bloquesCompletados.find(bloque => {
              const tareasDelBloque = progresoUsuario.filter(p => 
                p.id_tarea && p.id_tarea.bloque === bloque
              );
              return tareasDelBloque.length > 0;
            });
            progresoActual = bloqueSinErrores ? 1 : 0;
            porcentaje = bloqueSinErrores ? 100 : 0;
            meta = 1;
          }
          break;
      }
      
      return {
        _id: logro._id,
        logro: logro.logro,
        descripcion: logro.descripcion,
        icon: logro.icon,
        tipo: logro.tipo,
        meta: meta,
        bloque: logro.bloque,
        desbloqueado: desbloqueado,
        fecha_desbloqueo: desbloqueadoObj ? desbloqueadoObj.fecha_desbloqueo : null,
        progreso_actual: progresoActual,
        porcentaje: porcentaje
      };
    });
    
    res.json({
      logros: logrosConProgreso,
      estadisticas: {
        tareas_completadas: tareasCompletadas,
        puntaje_total: puntajeTotal,
        bloques_completados: bloquesCompletados,
        racha_actual: rachaActual
      }
    });
    
  } catch (error) {
    console.error("Error al obtener logros del usuario:", error);
    res.status(500).json({ error: "Error al obtener los logros" });
  }
});

// Verificar y desbloquear logros automáticamente
router.post("/verificar-logros", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const logrosDesbloqueados = [];
    
    // Obtener estadísticas ACTUALIZADAS del usuario
    const progresoUsuario = await Progreso.find({ id_usuario: userId, correcto: true });
    const tareasCompletadas = progresoUsuario.length;
    const puntajeTotal = progresoUsuario.reduce((sum, p) => sum + (p.puntaje || 0), 0);
    
    // Calcular bloques completados
    const bloquesCompletados = [];
    const bloques = [1, 2, 3, 4, 5, 6];
    
    for (const bloque of bloques) {
      const tareasBloque = await Tarea.find({ bloque });
      if (tareasBloque.length > 0) {
        const tareasCompletadasBloque = await Progreso.find({
          id_usuario: userId,
          id_tarea: { $in: tareasBloque.map(t => t._id) },
          correcto: true
        });
        
        if (tareasCompletadasBloque.length === tareasBloque.length) {
          bloquesCompletados.push(bloque);
        }
      }
    }
    
    // Obtener TODOS los logros
    const todosLogros = await Logro.find();
    
    // Para cada logro, verificar si se debe desbloquear
    for (const logro of todosLogros) {
      // Verificar si el usuario YA TIENE este logro
      const logroExistente = await LogroUnlocked.findOne({
        id_usuario: userId,
        id_logro: logro._id
      });
      
      if (logroExistente) {
        continue; // Ya está desbloqueado
      }
      
      // Si no existe, verificar si cumple las condiciones
      let cumpleCondiciones = false;
      
      switch (logro.tipo) {
        case 'tareas_completadas':
          if (logro.logro === 'Racha Perfecta') {
            // Calcular racha actual
            const ultimasTareas = await Progreso.find({ id_usuario: userId })
              .sort({ fecha_progreso: -1 })
              .limit(logro.meta);
            
            const racha = ultimasTareas.filter(p => p.correcto).length;
            cumpleCondiciones = racha >= logro.meta;
          } else {
            cumpleCondiciones = tareasCompletadas >= logro.meta;
          }
          break;
          
        case 'puntaje':
          cumpleCondiciones = puntajeTotal >= logro.meta;
          break;
          
        case 'bloque':
          if (logro.bloque) {
            cumpleCondiciones = bloquesCompletados.includes(logro.bloque);
          } else {
            // Logro "Sin Errores" - simplificado
            cumpleCondiciones = bloquesCompletados.length > 0;
          }
          break;
      }
      
      // Si cumple las condiciones, DESBLOQUEAR el logro
      if (cumpleCondiciones) {
        const nuevoLogroDesbloqueado = new LogroUnlocked({
          id_usuario: userId,
          id_logro: logro._id,
          fecha_desbloqueo: new Date()
        });
        
        await nuevoLogroDesbloqueado.save();
        await nuevoLogroDesbloqueado.populate('id_logro');
        
        logrosDesbloqueados.push(nuevoLogroDesbloqueado.id_logro);
      }
    }
    
    res.json({
      logros_desbloqueados: logrosDesbloqueados,
      total_desbloqueados: logrosDesbloqueados.length,
      mensaje: logrosDesbloqueados.length > 0 ? 
        `¡Desbloqueaste ${logrosDesbloqueados.length} logros!` : 
        "No hay nuevos logros para desbloquear"
    });
    
  } catch (error) {
    console.error("Error al verificar logros:", error);
    res.status(500).json({ error: "Error al verificar logros" });
  }
});

// Endpoint para forzar desbloqueo (debug)
router.post("/forzar-desbloqueo", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    let desbloqueados = 0;
    
    // Obtener estadísticas
    const progresoUsuario = await Progreso.find({ id_usuario: userId, correcto: true });
    const tareasCompletadas = progresoUsuario.length;
    const puntajeTotal = progresoUsuario.reduce((sum, p) => sum + (p.puntaje || 0), 0);
    
    // Obtener todos los logros
    const todosLogros = await Logro.find();
    
    for (const logro of todosLogros) {
      const yaTieneLogro = await LogroUnlocked.findOne({
        id_usuario: userId,
        id_logro: logro._id
      });
      
      if (!yaTieneLogro) {
        let debeDesbloquear = false;
        
        switch (logro.tipo) {
          case 'tareas_completadas':
            debeDesbloquear = tareasCompletadas >= logro.meta;
            break;
          case 'puntaje':
            debeDesbloquear = puntajeTotal >= logro.meta;
            break;
          case 'bloque':
            // Para debug, desbloquear algunos basados en progreso
            if (logro.bloque) {
              const tareasBloque = await Tarea.find({ bloque: logro.bloque });
              const completadasBloque = await Progreso.find({
                id_usuario: userId,
                id_tarea: { $in: tareasBloque.map(t => t._id) },
                correcto: true
              });
              debeDesbloquear = completadasBloque.length >= tareasBloque.length;
            } else {
              debeDesbloquear = tareasCompletadas >= 5; // Para "Sin Errores"
            }
            break;
        }
        
        if (debeDesbloquear) {
          const nuevoLogro = new LogroUnlocked({
            id_usuario: userId,
            id_logro: logro._id,
            fecha_desbloqueo: new Date()
          });
          await nuevoLogro.save();
          desbloqueados++;
        }
      }
    }
    
    res.json({ 
      mensaje: `Se desbloquearon ${desbloqueados} logros`,
      desbloqueados: desbloqueados
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al forzar desbloqueo" });
  }
});

module.exports = router;