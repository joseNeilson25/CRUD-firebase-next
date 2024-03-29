import { database } from "@/services/firebase"
import { FormEvent, useEffect, useState, ChangeEvent } from "react"

type Contato ={
  chave: string,
  nome: string,
  email: string,
  telefone: string,
  observacoes: string,
  foto: string
}
export default function Home() {

  const [foto, setFoto] = useState<File | null>(null);

  const [ nome,setNome] = useState('')
  const [ email,setEmail] = useState('')
  const [ telefone,setTelefone] = useState('')
  const [ observacoes,setObservacoes] = useState('')

  const [contatos, setContatos] = useState<Contato[]>()

  const [busca, setBusca] = useState<Contato[]>()

  const [estaBuscando, setEstaBuscando] = useState(false)

  const [chave, setChave] = useState('')

  const [atualizando, setAtualizando] = useState(false)

  useEffect(() =>{
    const RefContatos = database.ref('contatos')

    RefContatos.on('value', resultado =>{
      const resultadoContatos = Object.entries<Contato>(resultado.val() ?? {}).map(([chave,valor]) =>{
        return {
          'chave': chave,
          'nome': valor.nome,
          'email': valor.email,
          'telefone': valor.telefone,
          'observacoes': valor.observacoes,
          'foto': valor.foto
        }
      })
      setContatos(resultadoContatos)
    })
  },[])

  const gravar = (event: FormEvent) => {
    event.preventDefault();
  
    const ref = database.ref('contatos');
  
    const dados = {
      nome,
      email,
      telefone,
      observacoes,
      foto: foto?.name // ou qualquer outra propriedade do arquivo de foto que você deseje armazenar
    };
  
    ref.push(dados);
    setNome('');
    setEmail('');
    setTelefone('');
    setObservacoes('');
    setFoto(null);
  };
  
  

  function buscar(event: ChangeEvent<HTMLInputElement>){
    const palavra = event.target.value
    if(palavra.length > 0){
      setEstaBuscando(true)
      const dados = new Array
  
      contatos?.map(contato => {
        const regra = new RegExp(event.target.value, "gi")
        if(regra.test(contato.nome)){
          dados.push(contato)
        }
      })
      setBusca(dados)
    }else{setEstaBuscando(false)}
  }


  function editarDados(contato: Contato){
    setAtualizando(true)
    setChave(contato.chave)
    setNome(contato.nome)
    setEmail(contato.email)
    setTelefone(contato.telefone)
    setObservacoes(contato.observacoes)
  }

  function atualizarContato(){
    const ref= database.ref('contatos/')

    const dados = {
      'nome': nome,
      'email': email,
      'telefone': telefone,
      'observacoes': observacoes
    }

    ref.child(chave).update(dados)

    setNome('')
    setEmail('')
    setTelefone('')
    setObservacoes('')

    setAtualizando(false)
  }

  function deletar(ref:string){
    const referencia = database.ref(`contatos/${ref}`).remove()
  }

  const handleFotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFoto = event.target.files[0];
      setFoto(selectedFoto);
    }
  };
  
  
  return (
    <main className="container">
      <form action="" onSubmit={gravar}>
        <input type="text" value={nome} placeholder='Nome' onChange={event => setNome(event.target.value)} />
        <input type="email" value={email} placeholder='Email' onChange={event => setEmail(event.target.value)} />
        <input type="tel" value={telefone} placeholder='telefone' onChange={event => setTelefone(event.target.value)} />
        <input type="file" accept="image/*" onChange={handleFotoChange} />
        <textarea placeholder='Observações' value={observacoes} onChange={event => setObservacoes(event.target.value)}></textarea>
        { atualizando ?
          <button type="button" onClick={atualizarContato}>atualizar</button> :
          <button type="button" onClick={gravar}>Salvar</button>
        }
      </form>
      <div className="caixacontatos">
        <input type="text" onChange={buscar} placeholder='buscar' />
        {estaBuscando ? 
            busca?.map(contato => {
              return(
                  <div key={contato.chave} className="caixaindividual">
                    <div className="boxtitulo">
                      <p className="nometitulo">{contato.nome}</p>
                      <div>
                      <a onClick={() => editarDados(contato)} >editar</a>
                      <a onClick={() => deletar(contato.chave)} >excluir</a>
                    </div>
                   </div>
                   <div className="dados">
                    <p>{contato.email}</p>
                    <p>{contato.telefone}</p>
                    <p>{contato.observacoes}</p>
                    {contato.foto && <img src={contato.foto} alt="Foto do contato" />}
                   </div>
                  </div>
                    )
              }): contatos?.map(contato => {
            return(
              <div key={contato.chave} className="caixaindividual">
                <div className="boxtitulo">
                  <p className="nometitulo">{contato.nome}</p>
                    <div>
                      <a onClick={() => editarDados(contato)}>editar</a>
                      <a onClick={() => deletar(contato.chave)} >excluir</a>
                    </div>
                </div>
                <div className="dados">
                  <p>{contato.email}</p>
                  <p>{contato.telefone}</p>
                  <p>{contato.observacoes}</p>
                  {contato.foto && <img src={contato.foto} alt="Foto do contato" />}
                </div>
              </div>
            )
        })
      }
      </div>
    </main>
  )
}
