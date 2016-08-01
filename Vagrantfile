# -*- mode: ruby -*-
# vi: set ft=ruby :

# Require YAML module
require 'yaml'

# Vagrant API version
VAGRANTFILE_API_VERSION = "2"

# Read cluster settings
cluster_config = YAML.load_file('etc/cluster_config.yml')
servers = cluster_config["servers"]
providers = cluster_config["providers"]



# Check for missing plugins
required_plugins = %w(vagrant-hostmanager)
plugin_installed = false
required_plugins.each do |plugin|
  unless Vagrant.has_plugin?(plugin)
    system "vagrant plugin install #{plugin}"
    plugin_installed = true
  end
end

# If new plugins installed, restart Vagrant process
if plugin_installed === true
  exec "vagrant #{ARGV.join' '}"
end

# Create boxes
Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.hostmanager.enabled = true
  config.hostmanager.manage_host = true
  config.hostmanager.manage_guest = true
  config.hostmanager.ignore_private_ip = false
  config.hostmanager.include_offline = true

  $ansible_groups = {}

  # Collect server groups
  servers.each do |params|
    role = params["role"]
    host = params["name"]
    if $ansible_groups.has_key?(role)
      $ansible_groups[role] << host
    else
      $ansible_groups[role] = [host]
    end
  end

  $host_vars = {}

  servers.each do |params|
    host = params["name"]
    $host_vars[host] = {}
    params.each do |key, value|
        $host_vars[host]["instance_" + key] = value
     end
  end

  servers.each do |params|
    config.vm.define params["name"] do |srv|
      srv.vm.box = params["box"]
      srv.vm.hostname = params["name"]
      srv.vm.network "private_network", ip: params["ip"]

      if providers["virtualbox"]["enable"]
        srv.vm.provider :virtualbox do |vb|
          vb.name = params["name"]
          vb.memory = params["ram"]
        end
      end

      ## Install Pyton 2.7 package
      # srv.vm.provision "shell", inline: "apt-get -qq update && apt-get install -qq python"

      ## Delete hostname from loopback interface
      srv.vm.provision "shell", inline: "sed -ir 's/127.0.0.1.*$/127.0.0.1 localhost/' /etc/hosts"

      ## Ansible configuration
      srv.vm.provision :ansible do |ansible|
          #ansible.verbose = "vvvv"
          ansible.playbook = params["role"]+".yml"
          ansible.host_key_checking = false
          ansible.groups = $ansible_groups
          ansible.host_vars = $host_vars
      end
    end
  end
end
