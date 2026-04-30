// @ts-nocheck
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://spemvwgslwzorgyoztuz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZW12d2dzbHd6b3JneW96dHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjg5ODIsImV4cCI6MjA4ODYwNDk4Mn0.4eJ6co6pvUgNb8YnPpG7im5XzJ3hPbMbZDAJz4gMBcs";
const supabase = createClient(supabaseUrl, supabaseKey);

const App: React.FC = () => {
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showLogin, setShowLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("inventario");
  const [inventario, setInventario] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);
  const [devoluciones, setDevoluciones] = useState<any[]>([]);
  const [usuariosSistema, setUsuariosSistema] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchProducto, setSearchProducto] = useState("");
  const [productosEncontrados, setProductosEncontrados] = useState<any[]>([]);
  const [showResultadosBusqueda, setShowResultadosBusqueda] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [toasts, setToasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editandoProducto, setEditandoProducto] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [cargaMasiva, setCargaMasiva] = useState("");
  const [showCargaMasiva, setShowCargaMasiva] = useState(false);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [showDevolucion, setShowDevolucion] = useState(false);
  const [ventaADevolver, setVentaADevolver] = useState<any>(null);
  const [motivoDevolucion, setMotivoDevolucion] = useState("");
  const [showStockAlert, setShowStockAlert] = useState(true);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [showCrearUsuario, setShowCrearUsuario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: "",
    password: "",
    nombre: "",
    rol: "admin",
  });
  const [editandoUsuario, setEditandoUsuario] = useState<any>(null);
  const [detalleVentaActual, setDetalleVentaActual] = useState<any[]>([]);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio_compra: "",
    precio_venta: "",
    cantidad: "",
    categoria: "Batidos",
    proveedor: "",
  });

  const [nuevoRegistro, setNuevoRegistro] = useState({
    nombre: "",
    tipo: "Cliente",
    telefono: "",
    email: "",
    direccion: "",
  });

  const [ventaActual, setVentaActual] = useState({
    cliente_id: "",
    producto_id: "",
    cantidad: 1,
  });

  const usuariosBase = [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      nombre: "Administrador",
      rol: "admin",
    },
    {
      id: 2,
      username: "distribuidor",
      password: "distribuidor123",
      nombre: "Distribuidor Principal",
      rol: "vendedor",
    },
    {
      id: 3,
      username: "ana",
      password: "ana123",
      nombre: "Ana Martínez",
      rol: "admin",
    },
    {
      id: 4,
      username: "carlos",
      password: "carlos123",
      nombre: "Carlos López",
      rol: "admin",
    },
  ];

  // Efecto para buscar productos en tiempo real
  useEffect(() => {
    if (searchProducto.trim() === "") {
      setProductosEncontrados([]);
      setShowResultadosBusqueda(false);
    } else {
      const resultados = inventario.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchProducto.toLowerCase()) &&
          p.cantidad > 0
      );
      setProductosEncontrados(resultados);
      setShowResultadosBusqueda(true);
    }
  }, [searchProducto, inventario]);

  useEffect(() => {
    const initApp = async () => {
      await cargarUsuariosDesdeDB();
      const usuarioGuardado = localStorage.getItem("usuarioActual");
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        setUsuarioActual(usuario);
        setShowLogin(false);
        await cargarDatosConUsuario(usuario);
        if (usuario.rol === "vendedor") {
          setActiveTab("venta");
        }
      }
    };
    initApp();
  }, []);

  const cargarUsuariosDesdeDB = async () => {
    try {
      const { data, error } = await supabase.from("usuarios").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        setUsuariosSistema(data);
        localStorage.setItem("usuariosSistema", JSON.stringify(data));
      } else {
        setUsuariosSistema(usuariosBase);
        localStorage.setItem("usuariosSistema", JSON.stringify(usuariosBase));
      }
    } catch (error) {
      setUsuariosSistema(usuariosBase);
      localStorage.setItem("usuariosSistema", JSON.stringify(usuariosBase));
    }
  };

  const cargarDatosConUsuario = async (usuario: any) => {
    if (!usuario?.id) return;
    setLoading(true);
    try {
      // Cargar productos
      const { data: productos, error: errorProd } = await supabase
        .from("productos")
        .select("*")
        .eq("usuario_id", usuario.id)
        .order("nombre");

      if (errorProd) throw errorProd;
      setInventario(productos || []);

      // Cargar clientes/proveedores
      const { data: clientes, error: errorClient } = await supabase
        .from("clientes_proveedores")
        .select("*")
        .eq("usuario_id", usuario.id)
        .order("nombre");

      if (errorClient) throw errorClient;
      setRegistros(clientes || []);

      // Cargar ventas
      const { data: ventasData, error: errorVentas } = await supabase
        .from("ventas")
        .select("*")
        .eq("usuario_id", usuario.id)
        .order("fecha", { ascending: false });

      if (errorVentas) throw errorVentas;

      // Cargar detalles de ventas
      if (ventasData && ventasData.length > 0) {
        const ventasConDetalles = await Promise.all(
          ventasData.map(async (venta) => {
            const { data: detalles } = await supabase
              .from("detalle_ventas")
              .select("*")
              .eq("venta_id", venta.id);
            return { ...venta, productos: detalles || [] };
          })
        );
        setVentas(ventasConDetalles);
      } else {
        setVentas([]);
      }

      // Cargar devoluciones
      const { data: devolucionesData, error: errorDev } = await supabase
        .from("devoluciones")
        .select("*")
        .eq("usuario_id", usuario.id)
        .order("fecha", { ascending: false });

      if (errorDev) throw errorDev;

      // Cargar detalles de devoluciones
      if (devolucionesData && devolucionesData.length > 0) {
        const devolucionesConDetalles = await Promise.all(
          devolucionesData.map(async (dev) => {
            const { data: detalles } = await supabase
              .from("detalle_devoluciones")
              .select("*")
              .eq("devolucion_id", dev.id);
            return { ...dev, productos: detalles || [] };
          })
        );
        setDevoluciones(devolucionesConDetalles);
      } else {
        setDevoluciones([]);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      showToast("🌱 Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("username", loginForm.username)
        .eq("password", loginForm.password)
        .single();

      if (error) throw error;

      if (data) {
        setUsuarioActual(data);
        localStorage.setItem("usuarioActual", JSON.stringify(data));
        setShowLogin(false);
        await cargarDatosConUsuario(data);
        if (data.rol === "vendedor") {
          setActiveTab("venta");
        }
        showToast(`🌿 ¡Bienvenido ${data.nombre}!`, "success");
      }
    } catch (error) {
      // Fallback a usuarios base
      const usuario = usuariosBase.find(
        (u) =>
          u.username === loginForm.username && u.password === loginForm.password
      );
      if (usuario) {
        setUsuarioActual(usuario);
        localStorage.setItem("usuarioActual", JSON.stringify(usuario));
        setShowLogin(false);
        await cargarDatosConUsuario(usuario);
        if (usuario.rol === "vendedor") {
          setActiveTab("venta");
        }
        showToast(`🌿 ¡Bienvenido ${usuario.nombre}!`, "success");
      } else {
        showToast("🌱 Usuario o contraseña incorrectos", "error");
      }
    }
  };

  const handleLogout = () => {
    setUsuarioActual(null);
    localStorage.removeItem("usuarioActual");
    setShowLogin(true);
    setInventario([]);
    setRegistros([]);
    setVentas([]);
    setDevoluciones([]);
    setCarrito([]);
    showToast("🌿 Sesión cerrada", "info");
  };

  const showToast = (message: string, type: string = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setModalContent({ title, message, onConfirm });
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const crearUsuario = async () => {
    if (
      !nuevoUsuario.username ||
      !nuevoUsuario.password ||
      !nuevoUsuario.nombre
    ) {
      showToast("🌱 Complete todos los campos", "error");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .insert([
          {
            username: nuevoUsuario.username,
            password: nuevoUsuario.password,
            nombre: nuevoUsuario.nombre,
            rol: nuevoUsuario.rol,
          },
        ])
        .select();

      if (error) throw error;

      await cargarUsuariosDesdeDB();
      setShowCrearUsuario(false);
      setNuevoUsuario({ username: "", password: "", nombre: "", rol: "admin" });
      showToast("🌿 Usuario creado exitosamente", "success");
    } catch (error: any) {
      showToast("🌱 Error: " + error.message, "error");
    }
  };

  const editarUsuario = (usuario: any) => {
    setEditandoUsuario(usuario);
    setShowCrearUsuario(true);
  };

  const guardarEdicionUsuario = async () => {
    if (!editandoUsuario) return;

    try {
      const { error } = await supabase
        .from("usuarios")
        .update({
          username: editandoUsuario.username,
          password: editandoUsuario.password,
          nombre: editandoUsuario.nombre,
          rol: editandoUsuario.rol,
        })
        .eq("id", editandoUsuario.id);

      if (error) throw error;

      await cargarUsuariosDesdeDB();
      setShowCrearUsuario(false);
      setEditandoUsuario(null);
      showToast("🌿 Usuario actualizado", "success");
    } catch (error: any) {
      showToast("🌱 Error: " + error.message, "error");
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (id === 1) {
      showToast(
        "🌱 No se puede eliminar el usuario administrador principal",
        "error"
      );
      return;
    }

    showConfirmModal(
      "Confirmar eliminación",
      "¿Está seguro de eliminar este usuario?",
      async () => {
        try {
          const { error } = await supabase
            .from("usuarios")
            .delete()
            .eq("id", id);
          if (error) throw error;
          await cargarUsuariosDesdeDB();
          showToast("🍃 Usuario eliminado", "info");
        } catch (error: any) {
          showToast("🌱 Error: " + error.message, "error");
        }
        setShowModal(false);
      }
    );
  };

  const agregarProducto = async () => {
    if (
      !nuevoProducto.nombre ||
      !nuevoProducto.precio_compra ||
      !nuevoProducto.precio_venta ||
      !nuevoProducto.cantidad
    ) {
      showToast("🌱 Complete todos los campos", "error");
      return;
    }

    const producto = {
      nombre: nuevoProducto.nombre,
      precio_compras: parseFloat(nuevoProducto.precio_compra),
      precio_venta: parseFloat(nuevoProducto.precio_venta),
      cantidad: parseInt(nuevoProducto.cantidad),
      categoria: nuevoProducto.categoria,
      proveedor: nuevoProducto.proveedor || null,
      usuario_id: usuarioActual?.id,
    };

    try {
      const { error } = await supabase.from("productos").insert([producto]);
      if (error) throw error;
      await cargarDatosConUsuario(usuarioActual);
      setNuevoProducto({
        nombre: "",
        precio_compra: "",
        precio_venta: "",
        cantidad: "",
        categoria: "Batidos",
        proveedor: "",
      });
      showToast("🌿 Producto agregado", "success");
    } catch (error: any) {
      showToast("🌱 Error: " + error.message, "error");
    }
  };

  const eliminarProducto = (id: number) => {
    showConfirmModal("Confirmar", "🌱 ¿Eliminar producto?", async () => {
      try {
        const { error } = await supabase
          .from("productos")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await cargarDatosConUsuario(usuarioActual);
        showToast("🍃 Producto eliminado", "info");
      } catch (error: any) {
        showToast("🌱 Error: " + error.message, "error");
      }
      setShowModal(false);
    });
  };

  const editarProducto = (producto: any) => {
    setEditandoProducto(producto);
    setShowEditor(true);
  };

  const guardarEdicion = async () => {
    try {
      const { error } = await supabase
        .from("productos")
        .update({
          nombre: editandoProducto.nombre,
          precio_compras: editandoProducto.precio_compras,
          precio_venta: editandoProducto.precio_venta,
          cantidad: editandoProducto.cantidad,
          categoria: editandoProducto.categoria,
          proveedor: editandoProducto.proveedor,
        })
        .eq("id", editandoProducto.id);

      if (error) throw error;

      await cargarDatosConUsuario(usuarioActual);
      setShowEditor(false);
      setEditandoProducto(null);
      showToast("🌿 Producto actualizado", "success");
    } catch (error: any) {
      showToast("🌱 Error: " + error.message, "error");
    }
  };

  const cargarProductosMasivos = async () => {
    const lineas = cargaMasiva.split("\n").filter((l) => l.trim() !== "");
    const productos = lineas.map((nombre) => ({
      nombre: nombre.trim(),
      precio_compras: 0,
      precio_venta: 0,
      cantidad: 0,
      categoria: "Batidos",
      proveedor: null,
      usuario_id: usuarioActual?.id,
    }));

    showConfirmModal(
      "Confirmar carga masiva",
      `🌿 ¿Agregar ${productos.length} productos?`,
      async () => {
        try {
          const { error } = await supabase.from("productos").insert(productos);
          if (error) throw error;
          await cargarDatosConUsuario(usuarioActual);
          setCargaMasiva("");
          setShowCargaMasiva(false);
          showToast(`🌿 ${productos.length} productos agregados`, "success");
        } catch (error: any) {
          showToast("🌱 Error: " + error.message, "error");
        }
        setShowModal(false);
      }
    );
  };

  const agregarRegistro = async () => {
    if (!nuevoRegistro.nombre) {
      showToast("🌱 Ingrese el nombre", "error");
      return;
    }

    const registro = {
      nombre: nuevoRegistro.nombre,
      tipo: nuevoRegistro.tipo,
      telefono: nuevoRegistro.telefono,
      email: nuevoRegistro.email,
      direccion: nuevoRegistro.direccion,
      usuario_id: usuarioActual?.id,
    };

    try {
      const { error } = await supabase
        .from("clientes_proveedores")
        .insert([registro]);
      if (error) throw error;
      await cargarDatosConUsuario(usuarioActual);
      setNuevoRegistro({
        nombre: "",
        tipo: "Cliente",
        telefono: "",
        email: "",
        direccion: "",
      });
      showToast("🌿 Registro guardado", "success");
    } catch (error: any) {
      showToast("🌱 Error: " + error.message, "error");
    }
  };

  const eliminarRegistro = (id: number) => {
    showConfirmModal("Confirmar", "🌱 ¿Eliminar registro?", async () => {
      try {
        const { error } = await supabase
          .from("clientes_proveedores")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await cargarDatosConUsuario(usuarioActual);
        showToast("🍃 Registro eliminado", "info");
      } catch (error: any) {
        showToast("🌱 Error: " + error.message, "error");
      }
      setShowModal(false);
    });
  };

  const agregarACarrito = (producto: any) => {
    if (producto.cantidad < cantidadSeleccionada) {
      showToast("🌱 Stock insuficiente", "error");
      return;
    }

    const itemExistente = carrito.find((i) => i.producto_id === producto.id);
    const subtotal = producto.precio_venta * cantidadSeleccionada;
    const ganancia =
      (producto.precio_venta - producto.precio_compras) * cantidadSeleccionada;

    if (itemExistente) {
      if (producto.cantidad < itemExistente.cantidad + cantidadSeleccionada) {
        showToast("🌱 Stock insuficiente", "error");
        return;
      }
      setCarrito(
        carrito.map((i) =>
          i.producto_id === producto.id
            ? {
                ...i,
                cantidad: i.cantidad + cantidadSeleccionada,
                subtotal: i.subtotal + subtotal,
                ganancia: i.ganancia + ganancia,
              }
            : i
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio_compras: producto.precio_compras,
          precio_venta: producto.precio_venta,
          cantidad: cantidadSeleccionada,
          subtotal,
          ganancia,
        },
      ]);
    }

    setSearchProducto("");
    setShowResultadosBusqueda(false);
    setCantidadSeleccionada(1);
    showToast("🌿 Producto agregado", "success");
  };

  const eliminarDelCarrito = (index: number) => {
    setCarrito(carrito.filter((_, i) => i !== index));
    showToast("🍃 Producto eliminado", "info");
  };

  const calcularTotalesCarrito = () => {
    const totalVenta = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const totalCompra = carrito.reduce(
      (sum, item) => sum + item.precio_compras * item.cantidad,
      0
    );
    const gananciaTotal = carrito.reduce((sum, item) => sum + item.ganancia, 0);
    return { totalVenta, totalCompra, gananciaTotal };
  };

  const finalizarVenta = async () => {
    if (!ventaActual.cliente_id || carrito.length === 0) {
      showToast("🌱 Seleccione cliente y productos", "error");
      return;
    }

    const cliente = registros.find(
      (r) => r.id === parseInt(ventaActual.cliente_id)
    );
    const { totalVenta, totalCompra, gananciaTotal } = calcularTotalesCarrito();

    try {
      // Crear la venta
      const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .insert([
          {
            fecha: new Date().toISOString(),
            cliente_id: cliente?.id,
            cliente_nombre: cliente?.nombre || "",
            usuario_id: usuarioActual?.id,
            usuario_nombre: usuarioActual?.nombre || "Sistema",
            total_venta: totalVenta,
            total_compras: totalCompra,
            ganancia_total: gananciaTotal,
            metodo_pago: metodoPago,
          },
        ])
        .select()
        .single();

      if (ventaError) throw ventaError;

      // Crear detalles de la venta
      const detalles = carrito.map((item) => ({
        venta_id: ventaData.id,
        producto_id: item.producto_id,
        producto_nombre: item.nombre,
        cantidad: item.cantidad,
        precio_compras: item.precio_compras,
        precio_venta: item.precio_venta,
        subtotal: item.subtotal,
        ganancia: item.ganancia,
      }));

      const { error: detalleError } = await supabase
        .from("detalle_ventas")
        .insert(detalles);

      if (detalleError) throw detalleError;

      // Actualizar stock
      for (const item of carrito) {
        const producto = inventario.find((p) => p.id === item.producto_id);
        if (producto) {
          const { error: updateError } = await supabase
            .from("productos")
            .update({ cantidad: producto.cantidad - item.cantidad })
            .eq("id", item.producto_id);

          if (updateError) throw updateError;
        }
      }

      // Recargar datos
      await cargarDatosConUsuario(usuarioActual);

      // Limpiar carrito
      setCarrito([]);
      setVentaActual({ cliente_id: "", producto_id: "", cantidad: 1 });
      setMetodoPago("efectivo");
      showToast("🌿 ¡Venta realizada! 🌟", "success");
    } catch (error: any) {
      console.error("Error en venta:", error);
      showToast("🌱 Error: " + error.message, "error");
    }
  };

  const procesarDevolucion = async () => {
    if (!ventaADevolver || !motivoDevolucion) {
      showToast("🌱 Complete todos los campos", "error");
      return;
    }

    try {
      // Restaurar stock
      for (const item of ventaADevolver.productos) {
        const producto = inventario.find((p) => p.id === item.producto_id);
        if (producto) {
          await supabase
            .from("productos")
            .update({ cantidad: producto.cantidad + item.cantidad })
            .eq("id", producto.id);
        }
      }

      // Crear devolución
      const devolucion = {
        fecha: new Date().toISOString(),
        venta_id: ventaADevolver.id,
        venta_original: {
          id: ventaADevolver.id,
          fecha: ventaADevolver.fecha,
          cliente: ventaADevolver.cliente_nombre,
          total: ventaADevolver.total_venta,
        },
        motivo: motivoDevolucion,
        usuario_id: usuarioActual?.id,
        usuario_nombre: usuarioActual?.nombre,
      };

      const { data: devolucionData, error: devError } = await supabase
        .from("devoluciones")
        .insert([devolucion])
        .select()
        .single();

      if (devError) throw devError;

      // Crear detalles de devolución
      const detallesDevolucion = ventaADevolver.productos.map((item: any) => ({
        devolucion_id: devolucionData.id,
        producto_id: item.producto_id,
        producto_nombre: item.producto_nombre,
        cantidad: item.cantidad,
        precio_compras: item.precio_compras,
        precio_venta: item.precio_venta,
        subtotal: item.subtotal,
      }));

      await supabase.from("detalle_devoluciones").insert(detallesDevolucion);

      // Eliminar venta y detalles
      await supabase.from("ventas").delete().eq("id", ventaADevolver.id);
      await supabase
        .from("detalle_ventas")
        .delete()
        .eq("venta_id", ventaADevolver.id);

      // Recargar datos
      await cargarDatosConUsuario(usuarioActual);

      setShowDevolucion(false);
      setVentaADevolver(null);
      setMotivoDevolucion("");
      showToast("🌿 Devolución procesada", "success");
    } catch (error: any) {
      console.error("Error en devolución:", error);
      showToast("🌱 Error: " + error.message, "error");
    }
  };

  const eliminarDevolucion = (id: number) => {
    showConfirmModal("Confirmar", "¿Eliminar devolución?", async () => {
      try {
        await supabase
          .from("detalle_devoluciones")
          .delete()
          .eq("devolucion_id", id);
        await supabase.from("devoluciones").delete().eq("id", id);
        await cargarDatosConUsuario(usuarioActual);
        showToast("🍃 Devolución eliminada", "info");
      } catch (error: any) {
        showToast("🌱 Error: " + error.message, "error");
      }
      setShowModal(false);
    });
  };

  const cargarDetallesVenta = async (venta: any) => {
    try {
      const { data, error } = await supabase
        .from("detalle_ventas")
        .select("*")
        .eq("venta_id", venta.id);

      if (error) throw error;

      setVentaADevolver({
        ...venta,
        productos: data || [],
      });
      setShowDevolucion(true);
    } catch (error: any) {
      showToast("🌱 Error al cargar detalles", "error");
    }
  };

  const inventarioFiltrado = inventario.filter((p) => {
    const matchesSearch = p.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategoria =
      categoriaFiltro === "todas" || p.categoria === categoriaFiltro;
    return matchesSearch && matchesCategoria;
  });

  const categorias = ["todas", ...new Set(inventario.map((p) => p.categoria))];
  const stockBajo = inventario.filter((p) => p.cantidad < 10);

  if (showLogin) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">🌿</div>
          <h1>Herbalife</h1>
          <p className="login-subtitle">Nutrición que transforma vidas</p>

          <div className="login-input-group">
            <label className="login-label">🌱 Usuario</label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm({ ...loginForm, username: e.target.value })
              }
              onKeyPress={handleKeyPress}
              placeholder="Ingrese su usuario"
              autoFocus
              className="login-input"
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">🌿 Contraseña</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              onKeyPress={handleKeyPress}
              placeholder="Ingrese su contraseña"
              className="login-input"
            />
          </div>

          <button onClick={handleLogin} className="login-btn">
            Ingresar al Jardín
          </button>

          <div className="login-info">
            <p>👑 admin / admin123</p>
            <p>👩 ana / ana123</p>
            <p>👨 carlos / carlos123</p>
            <p>🌿 distribuidor / distribuidor123</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-card">
          <div className="loading-icon">🌱</div>
          <h2 style={{ color: "#1b4d3e", marginBottom: "10px" }}>
            Cargando datos...
          </h2>
          <div className="loading-spinner"></div>
          <p style={{ color: "#7f8c8d", marginTop: "20px" }}>
            Un momento por favor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === "success" && "🌿 "}
            {toast.type === "error" && "🌱 "}
            {toast.type === "warning" && "⚠️ "}
            {toast.type === "info" && "🍃 "}
            {toast.message}
          </div>
        ))}
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">🌿</div>
            <h3 className="modal-title">{modalContent.title}</h3>
            <p
              style={{
                textAlign: "center",
                color: "#7f8c8d",
                marginBottom: "25px",
              }}
            >
              {modalContent.message}
            </p>
            <div className="modal-buttons">
              <button
                onClick={() => setShowModal(false)}
                className="modal-btn"
                style={{ background: "#95a5a6", color: "white" }}
              >
                Cancelar
              </button>
              <button
                onClick={modalContent.onConfirm}
                className="modal-btn"
                style={{
                  background: "linear-gradient(135deg, #f44336, #d32f2f)",
                  color: "white",
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación/edición de usuarios */}
      {showCrearUsuario && usuarioActual?.id === 1 && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">{editandoUsuario ? "✏️" : "👤"}</div>
            <h3 className="modal-title">
              {editandoUsuario ? "Editar Usuario" : "Nuevo Usuario"}
            </h3>

            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input
                type="text"
                value={
                  editandoUsuario
                    ? editandoUsuario.username
                    : nuevoUsuario.username
                }
                onChange={(e) => {
                  if (editandoUsuario) {
                    setEditandoUsuario({
                      ...editandoUsuario,
                      username: e.target.value,
                    });
                  } else {
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      username: e.target.value,
                    });
                  }
                }}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                value={
                  editandoUsuario
                    ? editandoUsuario.password
                    : nuevoUsuario.password
                }
                onChange={(e) => {
                  if (editandoUsuario) {
                    setEditandoUsuario({
                      ...editandoUsuario,
                      password: e.target.value,
                    });
                  } else {
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      password: e.target.value,
                    });
                  }
                }}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input
                type="text"
                value={
                  editandoUsuario ? editandoUsuario.nombre : nuevoUsuario.nombre
                }
                onChange={(e) => {
                  if (editandoUsuario) {
                    setEditandoUsuario({
                      ...editandoUsuario,
                      nombre: e.target.value,
                    });
                  } else {
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      nombre: e.target.value,
                    });
                  }
                }}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rol</label>
              <select
                value={editandoUsuario ? editandoUsuario.rol : nuevoUsuario.rol}
                onChange={(e) => {
                  if (editandoUsuario) {
                    setEditandoUsuario({
                      ...editandoUsuario,
                      rol: e.target.value,
                    });
                  } else {
                    setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value });
                  }
                }}
                className="form-select"
              >
                <option value="admin">Administrador</option>
                <option value="vendedor">Distribuidor</option>
              </select>
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => {
                  setShowCrearUsuario(false);
                  setEditandoUsuario(null);
                }}
                className="modal-btn"
                style={{ background: "#95a5a6", color: "white" }}
              >
                Cancelar
              </button>
              <button
                onClick={editandoUsuario ? guardarEdicionUsuario : crearUsuario}
                className="modal-btn"
                style={{
                  background: "linear-gradient(135deg, #4caf7a, #2e7d5e)",
                  color: "white",
                }}
              >
                {editandoUsuario ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de devolución */}
      {showDevolucion && ventaADevolver && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">↩️</div>
            <h3 className="modal-title">Procesar Devolución</h3>

            <div
              style={{
                background: "#f9fff9",
                padding: "15px",
                borderRadius: "20px",
                marginBottom: "20px",
              }}
            >
              <strong style={{ color: "#1b4d3e" }}>Venta a devolver:</strong>
              <p style={{ marginTop: "8px", color: "#7f8c8d" }}>
                {new Date(ventaADevolver.fecha).toLocaleString()} -{" "}
                {ventaADevolver.cliente_nombre}
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#1b4d3e" }}>Productos:</strong>
              {ventaADevolver.productos?.map((p: any, i: number) => (
                <div
                  key={i}
                  style={{
                    background: "#f0fff0",
                    padding: "12px",
                    borderRadius: "15px",
                    marginTop: "8px",
                    border: "1px solid #c8e6c9",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>{p.producto_nombre}</span>
                  <br />
                  <span style={{ fontSize: "14px", color: "#7f8c8d" }}>
                    x{p.cantidad} - {formatCurrency(p.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Motivo de devolución</label>
              <select
                value={motivoDevolucion}
                onChange={(e) => setMotivoDevolucion(e.target.value)}
                className="form-select"
              >
                <option value="">Seleccione un motivo</option>
                <option value="Producto defectuoso">Producto defectuoso</option>
                <option value="Cliente insatisfecho">
                  Cliente insatisfecho
                </option>
                <option value="Error en venta">Error en venta</option>
                <option value="Cambio de producto">Cambio de producto</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => setShowDevolucion(false)}
                className="modal-btn"
                style={{ background: "#95a5a6", color: "white" }}
              >
                Cancelar
              </button>
              <button
                onClick={procesarDevolucion}
                className="modal-btn"
                style={{
                  background: "linear-gradient(135deg, #ff9800, #f57c00)",
                  color: "white",
                }}
              >
                Procesar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de productos */}
      {showEditor && editandoProducto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">✏️</div>
            <h3 className="modal-title">Editar Producto</h3>

            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                value={editandoProducto.nombre}
                onChange={(e) =>
                  setEditandoProducto({
                    ...editandoProducto,
                    nombre: e.target.value,
                  })
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                value={editandoProducto.categoria}
                onChange={(e) =>
                  setEditandoProducto({
                    ...editandoProducto,
                    categoria: e.target.value,
                  })
                }
                className="form-select"
              >
                <option value="Batidos">Batidos</option>
                <option value="Tés">Tés</option>
                <option value="Aloe">Aloe</option>
                <option value="Suplementos">Suplementos</option>
                <option value="Snacks">Snacks</option>
                <option value="Mercancía">Mercancía</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "15px",
              }}
            >
              <div>
                <label className="form-label">Precio Compra</label>
                <input
                  type="number"
                  value={editandoProducto.precio_compras}
                  onChange={(e) =>
                    setEditandoProducto({
                      ...editandoProducto,
                      precio_compras: parseFloat(e.target.value),
                    })
                  }
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Precio Venta</label>
                <input
                  type="number"
                  value={editandoProducto.precio_venta}
                  onChange={(e) =>
                    setEditandoProducto({
                      ...editandoProducto,
                      precio_venta: parseFloat(e.target.value),
                    })
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label className="form-label">Cantidad</label>
                <input
                  type="number"
                  value={editandoProducto.cantidad}
                  onChange={(e) =>
                    setEditandoProducto({
                      ...editandoProducto,
                      cantidad: parseInt(e.target.value),
                    })
                  }
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Proveedor</label>
                <input
                  type="text"
                  value={editandoProducto.proveedor || ""}
                  onChange={(e) =>
                    setEditandoProducto({
                      ...editandoProducto,
                      proveedor: e.target.value,
                    })
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => setShowEditor(false)}
                className="modal-btn"
                style={{ background: "#95a5a6", color: "white" }}
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                className="modal-btn"
                style={{
                  background: "linear-gradient(135deg, #4caf7a, #2e7d5e)",
                  color: "white",
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de carga masiva */}
      {showCargaMasiva && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">📦</div>
            <h3 className="modal-title">Carga Masiva de Productos</h3>

            <p
              style={{
                marginBottom: "15px",
                color: "#7f8c8d",
                textAlign: "center",
              }}
            >
              Ingresa un producto por línea
            </p>

            <textarea
              value={cargaMasiva}
              onChange={(e) => setCargaMasiva(e.target.value)}
              placeholder="🌿 Batido Nutricional F1 - Vainilla
🌿 Batido Nutricional F1 - Chocolate
🍵 Té Concentrado - Té Negro
🌱 Aloe Vera Concentrado"
              rows={8}
              className="form-textarea"
              style={{ marginBottom: "20px" }}
            />

            <div className="modal-buttons">
              <button
                onClick={() => setShowCargaMasiva(false)}
                className="modal-btn"
                style={{ background: "#95a5a6", color: "white" }}
              >
                Cancelar
              </button>
              <button
                onClick={cargarProductosMasivos}
                className="modal-btn"
                style={{
                  background: "linear-gradient(135deg, #4caf7a, #2e7d5e)",
                  color: "white",
                }}
              >
                Cargar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="app-header">
        <div className="header-logo">
          <div className="header-icon">🌿</div>
          <div className="header-title">
            <h1>
              {usuarioActual?.rol === "admin"
                ? "Admin Herbalife"
                : "Distribuidor Herbalife"}
            </h1>
            <p>
              <span>🍃</span> {usuarioActual?.nombre} ({usuarioActual?.rol})
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          🍃 Cerrar Sesión
        </button>
      </div>

      {/* Stock bajo alert */}
      {usuarioActual?.rol === "admin" &&
        showStockAlert &&
        stockBajo.length > 0 && (
          <div className="stock-alert">
            <span>
              ⚠️ Productos con stock bajo:{" "}
              {stockBajo.map((p) => p.nombre).join(", ")}
            </span>
            <button
              onClick={() => setShowStockAlert(false)}
              className="stock-alert-close"
            >
              ✖
            </button>
          </div>
        )}

      {/* Tabs */}
      <div className="tabs-container">
        {usuarioActual?.rol === "admin" ? (
          <>
            {[
              { id: "inventario", icon: "📦", label: "Productos" },
              { id: "registro", icon: "📋", label: "Registros" },
              { id: "venta", icon: "💰", label: "Ventas" },
              { id: "estadisticas", icon: "📊", label: "Stats" },
              ...(usuarioActual?.id === 1
                ? [{ id: "usuarios", icon: "👥", label: "Usuarios" }]
                : []),
              { id: "devoluciones", icon: "↩️", label: "Devoluciones" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </>
        ) : (
          <button
            onClick={() => setActiveTab("venta")}
            className="tab-btn active"
            style={{ width: "100%" }}
          >
            <span className="tab-icon">💰</span> Punto de Venta
          </button>
        )}
      </div>

      {/* Content */}
      <div className="content">
        {/* INVENTARIO */}
        {usuarioActual?.rol === "admin" && activeTab === "inventario" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  color: "#1b4d3e",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>📦</span> Productos ({inventario.length})
              </h2>
              <button
                onClick={() => setShowCargaMasiva(true)}
                className="btn-primary"
                style={{ width: "auto", padding: "12px 20px" }}
              >
                📋 Carga Masiva
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="🔍 Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="form-select"
                style={{ marginTop: "10px" }}
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "todas" ? "Todas las categorías" : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="card">
              <h3 className="card-title">
                <span>🌱</span> Nuevo Producto
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={nuevoProducto.nombre}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      nombre: e.target.value,
                    })
                  }
                  className="form-input"
                />
                <select
                  value={nuevoProducto.categoria}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      categoria: e.target.value,
                    })
                  }
                  className="form-select"
                >
                  <option value="Batidos">Batidos</option>
                  <option value="Tés">Tés</option>
                  <option value="Aloe">Aloe</option>
                  <option value="Suplementos">Suplementos</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Mercancía">Mercancía</option>
                </select>
                <input
                  type="number"
                  placeholder="Precio Compra"
                  value={nuevoProducto.precio_compra}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      precio_compra: e.target.value,
                    })
                  }
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Precio Venta"
                  value={nuevoProducto.precio_venta}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      precio_venta: e.target.value,
                    })
                  }
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={nuevoProducto.cantidad}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      cantidad: e.target.value,
                    })
                  }
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Proveedor"
                  value={nuevoProducto.proveedor}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      proveedor: e.target.value,
                    })
                  }
                  className="form-input"
                />
              </div>
              <button
                onClick={agregarProducto}
                className="btn-primary"
                style={{ marginTop: "20px" }}
              >
                ➕ Agregar Producto
              </button>
            </div>

            <h3 style={{ color: "#1b4d3e", marginBottom: "15px" }}>
              Lista de Productos
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {inventarioFiltrado.map((p) => (
                <div
                  key={p.id}
                  className="producto-card"
                  style={{ background: p.cantidad < 10 ? "#fff3e0" : "white" }}
                >
                  <div className="producto-header">
                    <span className="producto-nombre">{p.nombre}</span>
                    <div className="producto-acciones">
                      <button
                        onClick={() => editarProducto(p)}
                        className="btn-icon edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => eliminarProducto(p.id)}
                        className="btn-icon delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="producto-detalles">
                    <div className="producto-detalle">
                      <span className="detalle-label">Categoría</span>
                      <span className="detalle-valor">{p.categoria}</span>
                    </div>
                    <div className="producto-detalle">
                      <span className="detalle-label">Stock</span>
                      <span
                        className="detalle-valor"
                        style={{
                          color: p.cantidad < 10 ? "#e74c3c" : "#1b4d3e",
                        }}
                      >
                        {p.cantidad}
                      </span>
                    </div>
                    <div className="producto-detalle">
                      <span className="detalle-label">Compra</span>
                      <span className="detalle-valor">
                        {formatCurrency(p.precio_compras)}
                      </span>
                    </div>
                    <div className="producto-detalle">
                      <span className="detalle-label">Venta</span>
                      <span className="detalle-valor">
                        {formatCurrency(p.precio_venta)}
                      </span>
                    </div>
                  </div>
                  <div className="producto-ganancia">
                    <span>💰 Ganancia:</span>{" "}
                    <span>
                      {formatCurrency(p.precio_venta - p.precio_compras)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REGISTROS */}
        {usuarioActual?.rol === "admin" && activeTab === "registro" && (
          <div>
            <h2
              style={{
                color: "#1b4d3e",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>📋</span> Registros
            </h2>

            <div className="card">
              <h3 className="card-title">Nuevo Registro</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nuevoRegistro.nombre}
                  onChange={(e) =>
                    setNuevoRegistro({
                      ...nuevoRegistro,
                      nombre: e.target.value,
                    })
                  }
                  className="form-input"
                />
                <select
                  value={nuevoRegistro.tipo}
                  onChange={(e) =>
                    setNuevoRegistro({ ...nuevoRegistro, tipo: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="Cliente">Cliente</option>
                  <option value="Distribuidor">Distribuidor</option>
                </select>
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={nuevoRegistro.telefono}
                  onChange={(e) =>
                    setNuevoRegistro({
                      ...nuevoRegistro,
                      telefono: e.target.value,
                    })
                  }
                  className="form-input"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={nuevoRegistro.email}
                  onChange={(e) =>
                    setNuevoRegistro({
                      ...nuevoRegistro,
                      email: e.target.value,
                    })
                  }
                  className="form-input"
                />
                <textarea
                  placeholder="Dirección"
                  value={nuevoRegistro.direccion}
                  onChange={(e) =>
                    setNuevoRegistro({
                      ...nuevoRegistro,
                      direccion: e.target.value,
                    })
                  }
                  rows={3}
                  className="form-textarea"
                />
              </div>
              <button
                onClick={agregarRegistro}
                className="btn-primary"
                style={{ marginTop: "20px" }}
              >
                💾 Guardar Registro
              </button>
            </div>

            <h3
              style={{
                color: "#1b4d3e",
                marginBottom: "15px",
                marginTop: "25px",
              }}
            >
              Lista
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {registros.map((r) => (
                <div key={r.id} className="producto-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span style={{ fontWeight: "700", color: "#1b4d3e" }}>
                      {r.nombre}
                    </span>
                    <button
                      onClick={() => eliminarRegistro(r.id)}
                      className="btn-icon delete"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="producto-detalles">
                    <div className="producto-detalle">
                      <span className="detalle-label">Tipo</span>
                      <span className="detalle-valor">
                        <span
                          style={{
                            background:
                              r.tipo === "Cliente" ? "#4caf7a" : "#f39c12",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            display: "inline-block",
                          }}
                        >
                          {r.tipo}
                        </span>
                      </span>
                    </div>
                    {r.telefono && (
                      <div className="producto-detalle">
                        <span className="detalle-label">📞 Teléfono</span>
                        <span className="detalle-valor">{r.telefono}</span>
                      </div>
                    )}
                    {r.email && (
                      <div className="producto-detalle">
                        <span className="detalle-label">✉️ Email</span>
                        <span className="detalle-valor">{r.email}</span>
                      </div>
                    )}
                    {r.direccion && (
                      <div
                        className="producto-detalle"
                        style={{ gridColumn: "1/-1" }}
                      >
                        <span className="detalle-label">📍 Dirección</span>
                        <span className="detalle-valor">{r.direccion}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VENTAS */}
        {activeTab === "venta" && (
          <div>
            <h2
              style={{
                color: "#1b4d3e",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>💰</span> Punto de Venta
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div className="card">
                <h3 className="card-title">Nueva Venta</h3>

                <select
                  value={ventaActual.cliente_id}
                  onChange={(e) =>
                    setVentaActual({
                      ...ventaActual,
                      cliente_id: e.target.value,
                    })
                  }
                  className="form-select"
                  style={{ marginBottom: "20px" }}
                >
                  <option value="">Seleccionar cliente</option>
                  {registros
                    .filter((r) => r.tipo === "Cliente")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                </select>

                <div
                  className="search-container"
                  style={{ position: "relative" }}
                >
                  <input
                    type="text"
                    placeholder="🔍 Buscar productos..."
                    value={searchProducto}
                    onChange={(e) => setSearchProducto(e.target.value)}
                    className="form-input"
                    autoFocus
                  />
                  {showResultadosBusqueda &&
                    productosEncontrados.length > 0 && (
                      <div
                        className="search-results"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "white",
                          border: "1px solid #c8e6c9",
                          borderRadius: "15px",
                          marginTop: "5px",
                          maxHeight: "300px",
                          overflowY: "auto",
                          zIndex: 1000,
                          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        }}
                      >
                        {productosEncontrados.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => agregarACarrito(p)}
                            className="search-result-item"
                            style={{
                              padding: "15px",
                              cursor: "pointer",
                              borderBottom: "1px solid #e8f5e9",
                              transition: "background 0.2s",
                              hover: { background: "#f1f8e9" },
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#f1f8e9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "white")
                            }
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <strong style={{ color: "#1b4d3e" }}>
                                  {p.nombre}
                                </strong>
                                <div
                                  style={{ fontSize: "13px", color: "#7f8c8d" }}
                                >
                                  Stock: {p.cantidad}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div
                                  style={{
                                    color: "#4caf7a",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {formatCurrency(p.precio_venta)}
                                </div>
                                <div
                                  style={{ fontSize: "11px", color: "#95a5a6" }}
                                >
                                  G:{" "}
                                  {formatCurrency(
                                    p.precio_venta - p.precio_compras
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div style={{ marginTop: "20px" }}>
                  <label className="form-label">Cantidad:</label>
                  <div
                    className="cantidad-selector"
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      marginTop: "8px",
                    }}
                  >
                    <button
                      onClick={() =>
                        setCantidadSeleccionada(
                          Math.max(1, cantidadSeleccionada - 1)
                        )
                      }
                      className="cantidad-btn"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid #c8e6c9",
                        background: "white",
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={cantidadSeleccionada}
                      onChange={(e) =>
                        setCantidadSeleccionada(parseInt(e.target.value) || 1)
                      }
                      className="cantidad-input"
                      style={{
                        flex: 1,
                        padding: "10px",
                        textAlign: "center",
                        border: "1px solid #c8e6c9",
                        borderRadius: "10px",
                        fontSize: "16px",
                      }}
                    />
                    <button
                      onClick={() =>
                        setCantidadSeleccionada(cantidadSeleccionada + 1)
                      }
                      className="cantidad-btn"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid #c8e6c9",
                        background: "white",
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#7f8c8d",
                      textAlign: "center",
                    }}
                  >
                    Selecciona cantidad y haz clic en el producto
                  </p>
                </div>
              </div>

              <div className="card" style={{ border: "2px solid #4caf7a" }}>
                <h3 className="card-title">
                  <span>🛒</span> Carrito ({carrito.length} items)
                </h3>

                <div
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    marginBottom: "20px",
                  }}
                >
                  {carrito.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#95a5a6",
                        background: "white",
                        borderRadius: "20px",
                      }}
                    >
                      🛒 Carrito vacío
                    </div>
                  ) : (
                    carrito.map((item, index) => (
                      <div
                        key={index}
                        className="carrito-item"
                        style={{
                          background: "#f9fff9",
                          borderRadius: "15px",
                          padding: "15px",
                          marginBottom: "10px",
                          border: "1px solid #c8e6c9",
                        }}
                      >
                        <div
                          className="carrito-item-header"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            className="carrito-item-nombre"
                            style={{
                              fontWeight: "600",
                              color: "#1b4d3e",
                            }}
                          >
                            {item.nombre}
                          </span>
                          <button
                            onClick={() => eliminarDelCarrito(index)}
                            className="carrito-item-remove"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#e74c3c",
                              fontSize: "18px",
                              cursor: "pointer",
                            }}
                          >
                            ✖
                          </button>
                        </div>
                        <div
                          className="carrito-item-detalles"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <div className="carrito-detalle">
                            <span
                              className="detalle-label"
                              style={{ color: "#7f8c8d" }}
                            >
                              Cantidad
                            </span>
                            <span
                              className="detalle-valor"
                              style={{ fontWeight: "600" }}
                            >
                              {item.cantidad}
                            </span>
                          </div>
                          <div className="carrito-detalle">
                            <span
                              className="detalle-label"
                              style={{ color: "#7f8c8d" }}
                            >
                              Precio
                            </span>
                            <span
                              className="detalle-valor"
                              style={{ fontWeight: "600" }}
                            >
                              {formatCurrency(item.precio_venta)}
                            </span>
                          </div>
                        </div>
                        <div
                          className="carrito-subtotal"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            borderTop: "1px solid #c8e6c9",
                            paddingTop: "10px",
                          }}
                        >
                          <span>Subtotal:</span>{" "}
                          <strong style={{ color: "#4caf7a" }}>
                            {formatCurrency(item.subtotal)}
                          </strong>
                        </div>
                        {usuarioActual?.rol === "admin" && (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#4caf7a",
                              marginTop: "8px",
                              textAlign: "right",
                            }}
                          >
                            Ganancia: {formatCurrency(item.ganancia)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {carrito.length > 0 && (
                  <>
                    <div
                      className="total-card"
                      style={{
                        background: "#1b4d3e",
                        color: "white",
                        padding: "20px",
                        borderRadius: "15px",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        className="total-row"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "18px",
                          marginBottom: "10px",
                        }}
                      >
                        <span>Total Venta:</span>{" "}
                        <strong
                          className="total-final"
                          style={{ fontSize: "24px" }}
                        >
                          {formatCurrency(calcularTotalesCarrito().totalVenta)}
                        </strong>
                      </div>
                      {usuarioActual?.rol === "admin" && (
                        <div
                          className="total-row"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "15px",
                            color: "#a5d6a7",
                          }}
                        >
                          <span>Ganancia:</span>{" "}
                          <strong>
                            {formatCurrency(
                              calcularTotalesCarrito().gananciaTotal
                            )}
                          </strong>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <label
                        className="form-label"
                        style={{ color: "#1b4d3e", fontWeight: "600" }}
                      >
                        Método de pago:
                      </label>
                      <div
                        className="pago-grid"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: "10px",
                          marginTop: "10px",
                        }}
                      >
                        {["efectivo", "tarjeta", "transferencia", "otro"].map(
                          (metodo) => (
                            <button
                              key={metodo}
                              onClick={() => setMetodoPago(metodo)}
                              className={`pago-btn ${
                                metodoPago === metodo ? "active" : ""
                              }`}
                              style={{
                                padding: "12px",
                                border:
                                  metodoPago === metodo
                                    ? "2px solid #4caf7a"
                                    : "1px solid #c8e6c9",
                                borderRadius: "10px",
                                background:
                                  metodoPago === metodo ? "#e8f5e9" : "white",
                                color:
                                  metodoPago === metodo ? "#1b4d3e" : "#7f8c8d",
                                fontWeight:
                                  metodoPago === metodo ? "600" : "400",
                                cursor: "pointer",
                              }}
                            >
                              {metodo === "efectivo" && "💵 Efectivo"}
                              {metodo === "tarjeta" && "💳 Tarjeta"}
                              {metodo === "transferencia" && "🏦 Transf."}
                              {metodo === "otro" && "📱 Otro"}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <button
                      onClick={finalizarVenta}
                      className="btn-primary"
                      style={{
                        marginTop: "20px",
                        padding: "18px",
                        fontSize: "18px",
                        width: "100%",
                        background: "linear-gradient(135deg, #4caf7a, #2e7d5e)",
                        color: "white",
                        border: "none",
                        borderRadius: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      🌿 Finalizar Venta 🌟
                    </button>
                  </>
                )}
              </div>
            </div>

            <h3
              style={{
                color: "#1b4d3e",
                marginTop: "30px",
                marginBottom: "15px",
              }}
            >
              {usuarioActual?.rol === "admin"
                ? "Historial de Ventas"
                : "Mis Últimas Ventas"}
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {(usuarioActual?.rol === "admin"
                ? ventas
                : ventas.filter(
                    (v) => v.usuario_nombre === usuarioActual?.nombre
                  )
              )
                .slice(0, 10)
                .map((v) => (
                  <div
                    key={v.id}
                    className="producto-card"
                    style={{
                      background: "white",
                      borderRadius: "15px",
                      padding: "15px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <span style={{ fontWeight: "700", color: "#1b4d3e" }}>
                        {v.cliente_nombre}
                      </span>
                      <span
                        className={`badge badge-${v.metodo_pago}`}
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          background:
                            v.metodo_pago === "efectivo"
                              ? "#4caf7a"
                              : v.metodo_pago === "tarjeta"
                              ? "#f39c12"
                              : v.metodo_pago === "transferencia"
                              ? "#3498db"
                              : "#95a5a6",
                          color: "white",
                        }}
                      >
                        {v.metodo_pago}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#7f8c8d",
                        marginBottom: "8px",
                      }}
                    >
                      {new Date(v.fecha).toLocaleString()}
                    </div>
                    <div style={{ fontSize: "14px", marginBottom: "10px" }}>
                      {v.productos?.length || 0} producto(s)
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong style={{ fontSize: "18px", color: "#4caf7a" }}>
                        {formatCurrency(v.total_venta)}
                      </strong>
                      {usuarioActual?.rol === "admin" && (
                        <button
                          onClick={() => cargarDetallesVenta(v)}
                          className="btn-warning"
                          style={{
                            padding: "8px 15px",
                            fontSize: "13px",
                            background: "#ff9800",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                          }}
                        >
                          ↩️ Devolver
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        {usuarioActual?.rol === "admin" && activeTab === "estadisticas" && (
          <div>
            <h2
              style={{
                color: "#1b4d3e",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>📊</span> Estadísticas
            </h2>

            <div
              className="stats-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              <div
                className="stat-card"
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "20px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  className="stat-title"
                  style={{
                    color: "#1b4d3e",
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>📦</span> Inventario
                </h3>
                <div
                  className="stat-numbers"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1b4d3e",
                      }}
                    >
                      {inventario.length}
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Productos
                    </div>
                  </div>
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1b4d3e",
                      }}
                    >
                      {inventario.reduce((s, p) => s + p.cantidad, 0)}
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Unidades
                    </div>
                  </div>
                  <div
                    className="stat-number-item"
                    style={{ gridColumn: "1/-1" }}
                  >
                    <div
                      className="stat-number-value"
                      style={{
                        color: "#4caf7a",
                        fontSize: "20px",
                        fontWeight: "700",
                      }}
                    >
                      {formatCurrency(
                        inventario.reduce(
                          (s, p) =>
                            s +
                            (p.precio_venta - p.precio_compras) * p.cantidad,
                          0
                        )
                      )}
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Ganancia Potencial
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="stat-card"
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "20px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  className="stat-title"
                  style={{
                    color: "#1b4d3e",
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>👥</span> Clientes y Distribuidores
                </h3>
                <div
                  className="stat-numbers"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1b4d3e",
                      }}
                    >
                      {registros.filter((r) => r.tipo === "Cliente").length}
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Clientes
                    </div>
                  </div>
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1b4d3e",
                      }}
                    >
                      {
                        registros.filter((r) => r.tipo === "Distribuidor")
                          .length
                      }
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Distribuidores
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="stat-card"
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "20px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  className="stat-title"
                  style={{
                    color: "#1b4d3e",
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>💰</span> Ventas
                </h3>
                <div
                  className="stat-numbers"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1b4d3e",
                      }}
                    >
                      {ventas.length}
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Ventas
                    </div>
                  </div>
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#1b4d3e",
                      }}
                    >
                      {formatCurrency(
                        ventas.reduce((s, v) => s + v.total_venta, 0)
                      )}
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Ingresos
                    </div>
                  </div>
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        color: "#4caf7a",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      {formatCurrency(
                        ventas.reduce((s, v) => s + v.ganancia_total, 0)
                      )}
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Ganancias
                    </div>
                  </div>
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1b4d3e",
                      }}
                    >
                      {devoluciones.length}
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Devoluciones
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="stat-card"
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "20px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  className="stat-title"
                  style={{
                    color: "#1b4d3e",
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>💳</span> Métodos de Pago
                </h3>
                <div
                  className="stat-numbers"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1b4d3e",
                      }}
                    >
                      {
                        ventas.filter((v) => v.metodo_pago === "efectivo")
                          .length
                      }
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Efectivo
                    </div>
                  </div>
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1b4d3e",
                      }}
                    >
                      {ventas.filter((v) => v.metodo_pago === "tarjeta").length}
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Tarjeta
                    </div>
                  </div>
                  <div className="stat-number-item">
                    <div
                      className="stat-number-value"
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1b4d3e",
                      }}
                    >
                      {
                        ventas.filter((v) => v.metodo_pago === "transferencia")
                          .length
                      }
                    </div>
                    <div
                      className="stat-number-label"
                      style={{ color: "#7f8c8d" }}
                    >
                      Transferencia
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USUARIOS - Solo visible para admin principal (ID=1) */}
        {usuarioActual?.id === 1 && activeTab === "usuarios" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  color: "#1b4d3e",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>👥</span> Gestión de Usuarios
              </h2>
              <button
                onClick={() => {
                  setEditandoUsuario(null);
                  setNuevoUsuario({
                    username: "",
                    password: "",
                    nombre: "",
                    rol: "admin",
                  });
                  setShowCrearUsuario(true);
                }}
                className="btn-primary"
                style={{ width: "auto", padding: "12px 20px" }}
              >
                ➕ Nuevo Admin
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {usuariosSistema.map((u: any) => (
                <div
                  key={u.id}
                  className="producto-card"
                  style={{
                    background: "white",
                    borderRadius: "15px",
                    padding: "15px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span style={{ fontWeight: "700", color: "#1b4d3e" }}>
                      {u.nombre}
                    </span>
                    <span
                      className={`badge ${
                        u.rol === "admin" ? "badge-admin" : "badge-vendedor"
                      }`}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        background: u.rol === "admin" ? "#4caf7a" : "#f39c12",
                        color: "white",
                      }}
                    >
                      {u.rol}
                    </span>
                  </div>
                  <div
                    className="producto-detalles"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div className="producto-detalle">
                      <span
                        className="detalle-label"
                        style={{ color: "#7f8c8d" }}
                      >
                        Usuario
                      </span>
                      <span
                        className="detalle-valor"
                        style={{ fontWeight: "600" }}
                      >
                        {u.username}
                      </span>
                    </div>
                    <div className="producto-detalle">
                      <span
                        className="detalle-label"
                        style={{ color: "#7f8c8d" }}
                      >
                        ID
                      </span>
                      <span
                        className="detalle-valor"
                        style={{ fontWeight: "600" }}
                      >
                        #{u.id}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "12px" }}
                  >
                    <button
                      onClick={() => editarUsuario(u)}
                      className="btn-icon edit"
                      style={{
                        width: "50%",
                        padding: "10px",
                        background: "#4caf7a",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => eliminarUsuario(u.id)}
                      className="btn-icon delete"
                      style={{
                        width: "50%",
                        padding: "10px",
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEVOLUCIONES */}
        {usuarioActual?.rol === "admin" && activeTab === "devoluciones" && (
          <div>
            <h2
              style={{
                color: "#1b4d3e",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>↩️</span> Historial de Devoluciones
            </h2>

            {devoluciones.length === 0 ? (
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "40px",
                  background: "white",
                  borderRadius: "15px",
                }}
              >
                <div style={{ fontSize: "50px", marginBottom: "20px" }}>🍃</div>
                <p style={{ color: "#7f8c8d" }}>
                  No hay devoluciones registradas
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {devoluciones.map((d) => (
                  <div
                    key={d.id}
                    className="producto-card"
                    style={{
                      background: "white",
                      borderRadius: "15px",
                      padding: "15px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <span style={{ fontWeight: "700", color: "#1b4d3e" }}>
                        {new Date(d.fecha).toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="producto-detalles"
                      style={{
                        display: "grid",
                        gap: "10px",
                      }}
                    >
                      <div
                        className="producto-detalle"
                        style={{ gridColumn: "1/-1" }}
                      >
                        <span
                          className="detalle-label"
                          style={{ color: "#7f8c8d" }}
                        >
                          Venta original
                        </span>
                        <span
                          className="detalle-valor"
                          style={{ fontWeight: "600" }}
                        >
                          {d.venta_original?.cliente} -{" "}
                          {formatCurrency(d.venta_original?.total)}
                        </span>
                      </div>
                      <div
                        className="producto-detalle"
                        style={{ gridColumn: "1/-1" }}
                      >
                        <span
                          className="detalle-label"
                          style={{ color: "#7f8c8d" }}
                        >
                          Productos
                        </span>
                        <span className="detalle-valor">
                          {d.productos
                            ?.map((p: any) => p.producto_nombre)
                            .join(", ")}
                        </span>
                      </div>
                      <div
                        className="producto-detalle"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <span
                            className="detalle-label"
                            style={{ color: "#7f8c8d" }}
                          >
                            Motivo
                          </span>
                          <span
                            className="detalle-valor"
                            style={{ fontWeight: "600" }}
                          >
                            {d.motivo}
                          </span>
                        </div>
                        <div>
                          <span
                            className="detalle-label"
                            style={{ color: "#7f8c8d" }}
                          >
                            Usuario
                          </span>
                          <span
                            className="detalle-valor"
                            style={{ fontWeight: "600" }}
                          >
                            {d.usuario_nombre}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarDevolucion(d.id)}
                      className="btn-danger"
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        width: "100%",
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Eliminar del historial
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
