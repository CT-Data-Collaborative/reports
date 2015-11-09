# Vagrant Configuration

# First, tell it which box, update = False, static private IP
Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.box_check_update = false
  config.vm.synced_folder ".", "/vagrant", disabled: true
  config.vm.network "private_network", ip: "192.168.33.101"

  # Configure vbox to not use a gui, give it 2Gb memory
  config.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = "2048"
  end # end vbox configure

# Ansible config
    config.vm.provision "ansible" do |ansible|
        ansible.host_key_checking = false
        ansible.playbook = "playbook.yml"
    end # end ansible

end # end configure